from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func, case, literal, String
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.course import Course, Category, CourseSection, Lesson, CourseDifficulty
from app.models.user import User
from app.models.progress import CourseEnrollment
from app.schemas.course import (
    CourseResponse, CourseDetailResponse, CategoryResponse,
    CourseCreate, CourseUpdate, SectionSummaryResponse, LessonSummaryResponse
)
from app.api.deps import get_optional_user, get_current_user, get_current_instructor_or_admin

router = APIRouter()

@router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Category).order_by(Category.display_order))
    return [CategoryResponse.model_validate(c) for c in res.scalars().all()]

@router.get("/", response_model=List[CourseResponse])
async def list_courses(
    category: Optional[str] = None,
    difficulty: Optional[CourseDifficulty] = None,
    is_free: Optional[bool] = None,
    search: Optional[str] = None,
    featured: Optional[bool] = None,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    query = select(Course).options(selectinload(Course.category), selectinload(Course.instructor)).where(Course.is_published == True)

    if category:
        query = query.join(Course.category).where(Category.slug == category)
    if difficulty:
        query = query.where(Course.difficulty == difficulty)
    if is_free is not None:
        query = query.where(Course.is_free == is_free)
    if featured is not None:
        query = query.where(Course.featured == featured)
        
    rank_clause = None
    if search and search.strip():
        clean_phrase = " ".join(search.split())  # trim + collapse whitespace
        clean_norm = func.lower(func.unaccent(literal(clean_phrase, type_=String)))
        title_norm = func.lower(func.unaccent(func.coalesce(Course.title, "")))
        haystack = func.lower(func.unaccent(
            func.concat_ws(" ",
                func.coalesce(Course.title, ""),
                func.coalesce(Course.short_description, ""),
                func.coalesce(Course.full_description, "")
            )
        ))
        for token in clean_phrase.split():
            tok_norm = func.lower(func.unaccent(literal(token, type_=String)))
            query = query.where(haystack.like(func.concat("%", tok_norm, "%")))

        # Title ranking: exact phrase > title contains phrase > other matches
        rank_clause = case(
            (title_norm == clean_norm, 0),
            (title_norm.like(func.concat("%", clean_norm, "%")), 1),
            else_=2
        )

    if rank_clause is not None:
        query = query.order_by(rank_clause, Course.featured.desc(), Course.created_at.desc()).limit(limit).offset(offset)
    else:
        query = query.order_by(Course.featured.desc(), Course.created_at.desc()).limit(limit).offset(offset)
    res = await db.execute(query)
    courses = res.scalars().all()

    output = []
    for c in courses:
        item = CourseResponse(
            id=c.id,
            title=c.title,
            slug=c.slug,
            short_description=c.short_description,
            cover_image=c.cover_image,
            category_id=c.category_id,
            category_name=c.category.name if c.category else None,
            instructor_name=c.instructor.full_name if c.instructor else "Echipa NursLab",
            difficulty=c.difficulty,
            estimated_hours=c.estimated_hours,
            is_free=c.is_free,
            price=c.price,
            currency=c.currency,
            is_published=c.is_published,
            featured=c.featured,
            has_certificate=c.has_certificate,
            total_lessons_count=0
        )
        output.append(item)
    return output

@router.get("/{slug}", response_model=CourseDetailResponse)
async def get_course_detail(
    slug: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    query = (
        select(Course)
        .options(
            selectinload(Course.category),
            selectinload(Course.instructor),
            selectinload(Course.sections).selectinload(CourseSection.lessons)
        )
        .where(Course.slug == slug)
    )
    res = await db.execute(query)
    course = res.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Cursul nu a fost găsit")

    is_enrolled = False
    progress_percent = 0
    if current_user:
        enr_res = await db.execute(
            select(CourseEnrollment).where(
                CourseEnrollment.user_id == current_user.id,
                CourseEnrollment.course_id == course.id
            )
        )
        enrollment = enr_res.scalar_one_or_none()
        if enrollment:
            is_enrolled = True
            progress_percent = enrollment.progress_percent

    sections_data = []
    for sec in sorted(course.sections, key=lambda s: s.order_index):
        lessons_data = []
        for les in sorted(sec.lessons, key=lambda l: l.order_index):
            lessons_data.append(LessonSummaryResponse.model_validate(les))
        sec_obj = SectionSummaryResponse(
            id=sec.id,
            title=sec.title,
            description=sec.description,
            order_index=sec.order_index,
            lessons=lessons_data
        )
        sections_data.append(sec_obj)

    return CourseDetailResponse(
        id=course.id,
        title=course.title,
        slug=course.slug,
        short_description=course.short_description,
        full_description=course.full_description,
        cover_image=course.cover_image,
        preview_video_url=course.preview_video_url,
        category_id=course.category_id,
        category=CategoryResponse.model_validate(course.category) if course.category else None,
        instructor_id=course.instructor_id,
        instructor_name=course.instructor.full_name if course.instructor else "Echipa NursLab",
        instructor_specialty=course.instructor.nursing_specialty if course.instructor else "Specialist Nursing",
        difficulty=course.difficulty,
        estimated_hours=course.estimated_hours,
        is_free=course.is_free,
        price=course.price,
        currency=course.currency,
        is_published=course.is_published,
        featured=course.featured,
        has_certificate=course.has_certificate,
        completion_threshold_percent=course.completion_threshold_percent,
        sections=sections_data,
        is_enrolled=is_enrolled,
        progress_percent=progress_percent,
    )

@router.post("/{course_id}/enroll")
async def enroll_course(
    course_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course_res = await db.execute(select(Course).where(Course.id == course_id))
    course = course_res.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Curs inexistent")

    # Check if already enrolled
    enr_res = await db.execute(
        select(CourseEnrollment).where(
            CourseEnrollment.user_id == current_user.id,
            CourseEnrollment.course_id == course.id
        )
    )
    existing = enr_res.scalar_one_or_none()
    if existing:
        return {"status": "already_enrolled", "enrollment_id": existing.id}

    if not course.is_free:
        # Check active entitlement or subscription
        from app.models.payment import Entitlement, EntitlementType
        ent_res = await db.execute(
            select(Entitlement).where(
                Entitlement.user_id == current_user.id,
                Entitlement.is_active == True,
                or_(
                    Entitlement.entitlement_type == EntitlementType.FULL_PLATFORM,
                    Entitlement.reference_id == course.id
                )
            )
        )
        if not ent_res.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="Acest curs necesită achiziție sau abonament activ"
            )

    new_enrollment = CourseEnrollment(
        user_id=current_user.id,
        course_id=course.id,
        progress_percent=0,
        is_completed=False,
    )
    db.add(new_enrollment)
    await db.commit()
    await db.refresh(new_enrollment)
    return {"status": "enrolled", "enrollment_id": new_enrollment.id}
