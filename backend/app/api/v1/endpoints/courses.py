import re
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func, case, literal, String
from sqlalchemy.orm import selectinload
from sqlalchemy.orm.attributes import flag_modified
from app.core.database import get_db
from app.models.course import Course, Category, CourseSection, Lesson, CourseDifficulty, LessonType
from app.models.user import User, UserRole
from app.models.progress import CourseEnrollment
from app.schemas.course import (
    CourseResponse, CourseDetailResponse, CategoryResponse,
    CourseCreate, CourseUpdate, SectionSummaryResponse, LessonSummaryResponse,
    CourseAdminResponse, CourseSectionAdminResponse, LessonAdminResponse,
    CourseSectionCreate, CourseSectionUpdate, LessonCreate, LessonUpdate,
    InstructorOptionResponse
)
from app.api.deps import get_optional_user, get_current_user, get_current_admin

router = APIRouter()

@router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Category).order_by(Category.display_order))
    return [CategoryResponse.model_validate(c) for c in res.scalars().all()]

@router.get("/instructors", response_model=List[InstructorOptionResponse])
async def list_instructors(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    res = await db.execute(select(User).where(User.is_active == True).order_by(User.full_name))
    users = res.scalars().all()
    return [
        InstructorOptionResponse(
            id=u.id,
            full_name=u.full_name,
            email=u.email,
            specialty=u.nursing_specialty
        )
        for u in users
    ]

@router.get("/admin/all", response_model=List[CourseAdminResponse])
async def list_admin_courses(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    query = (
        select(Course)
        .options(
            selectinload(Course.category),
            selectinload(Course.instructor),
            selectinload(Course.sections).selectinload(CourseSection.lessons)
        )
        .order_by(Course.created_at.desc())
    )
    res = await db.execute(query)
    courses = res.scalars().all()

    output = []
    for c in courses:
        sections_list = []
        total_lessons = 0
        for s in sorted(c.sections, key=lambda x: x.order_index):
            lessons_list = []
            for l in sorted(s.lessons, key=lambda x: x.order_index):
                total_lessons += 1
                lessons_list.append(LessonAdminResponse.model_validate(l))
            sections_list.append(
                CourseSectionAdminResponse(
                    id=s.id,
                    course_id=s.course_id,
                    title=s.title,
                    description=s.description,
                    order_index=s.order_index,
                    lessons=lessons_list
                )
            )
        output.append(
            CourseAdminResponse(
                id=c.id,
                title=c.title,
                slug=c.slug,
                short_description=c.short_description,
                full_description=c.full_description,
                cover_image=c.cover_image,
                preview_video_url=c.preview_video_url,
                category_id=c.category_id,
                category_name=c.category.name if c.category else None,
                instructor_id=c.instructor_id,
                instructor_name=c.instructor.full_name if c.instructor else "Echipa NursLab",
                instructor_specialty=c.instructor.nursing_specialty if c.instructor else None,
                difficulty=c.difficulty,
                estimated_hours=c.estimated_hours,
                is_free=c.is_free,
                price=c.price,
                currency=c.currency,
                is_published=c.is_published,
                status=c.status,
                featured=c.featured,
                has_certificate=c.has_certificate,
                completion_threshold_percent=c.completion_threshold_percent,
                metadata_json=c.metadata_json or {},
                total_sections_count=len(sections_list),
                total_lessons_count=total_lessons,
                sections=sections_list,
                created_at=c.created_at,
                updated_at=c.updated_at
            )
        )
    return output

@router.post("/", response_model=CourseAdminResponse, status_code=status.HTTP_201_CREATED)
async def create_course(
    course_in: CourseCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    slug = course_in.slug
    if not slug:
        slug = re.sub(r'[^a-z0-9]+', '-', course_in.title.lower()).strip('-')

    base_slug = slug
    counter = 1
    while True:
        chk = await db.execute(select(Course).where(Course.slug == slug))
        if not chk.scalar_one_or_none():
            break
        slug = f"{base_slug}-{counter}"
        counter += 1

    is_pub = course_in.is_published
    st = course_in.status or "draft"
    if st == "published":
        is_pub = True
    elif not is_pub and st not in ["draft", "archived"]:
        st = "draft"

    course = Course(
        title=course_in.title,
        slug=slug,
        short_description=course_in.short_description,
        full_description=course_in.full_description,
        cover_image=course_in.cover_image,
        preview_video_url=course_in.preview_video_url,
        category_id=course_in.category_id,
        instructor_id=course_in.instructor_id or admin.id,
        difficulty=course_in.difficulty,
        estimated_hours=course_in.estimated_hours,
        is_free=course_in.is_free,
        price=course_in.price,
        currency=course_in.currency,
        is_published=is_pub,
        status=st,
        featured=course_in.featured,
        has_certificate=course_in.has_certificate,
        completion_threshold_percent=course_in.completion_threshold_percent,
        metadata_json=course_in.metadata_json or {}
    )
    db.add(course)
    await db.commit()
    await db.refresh(course)

    res = await db.execute(
        select(Course)
        .options(
            selectinload(Course.category),
            selectinload(Course.instructor),
            selectinload(Course.sections).selectinload(CourseSection.lessons)
        )
        .where(Course.id == course.id)
    )
    c = res.scalar_one()
    return CourseAdminResponse(
        id=c.id,
        title=c.title,
        slug=c.slug,
        short_description=c.short_description,
        full_description=c.full_description,
        cover_image=c.cover_image,
        preview_video_url=c.preview_video_url,
        category_id=c.category_id,
        category_name=c.category.name if c.category else None,
        instructor_id=c.instructor_id,
        instructor_name=c.instructor.full_name if c.instructor else "Echipa NursLab",
        instructor_specialty=c.instructor.nursing_specialty if c.instructor else None,
        difficulty=c.difficulty,
        estimated_hours=c.estimated_hours,
        is_free=c.is_free,
        price=c.price,
        currency=c.currency,
        is_published=c.is_published,
        status=c.status,
        featured=c.featured,
        has_certificate=c.has_certificate,
        completion_threshold_percent=c.completion_threshold_percent,
        metadata_json=c.metadata_json or {},
        total_sections_count=0,
        total_lessons_count=0,
        sections=[],
        created_at=c.created_at,
        updated_at=c.updated_at
    )

@router.put("/{course_id}", response_model=CourseAdminResponse)
async def update_course(
    course_id: str,
    course_in: CourseUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    res = await db.execute(
        select(Course)
        .options(
            selectinload(Course.category),
            selectinload(Course.instructor),
            selectinload(Course.sections).selectinload(CourseSection.lessons)
        )
        .where(Course.id == course_id)
    )
    course = res.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Cursul nu a fost găsit")

    update_data = course_in.model_dump(exclude_unset=True)

    if "slug" in update_data and update_data["slug"] != course.slug:
        new_slug = update_data["slug"]
        chk = await db.execute(select(Course).where(Course.slug == new_slug, Course.id != course.id))
        if chk.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Există deja un curs cu acest slug")

    if "status" in update_data:
        if update_data["status"] == "published":
            course.is_published = True
        elif update_data["status"] in ["draft", "archived"]:
            course.is_published = False

    for field, val in update_data.items():
        setattr(course, field, val)

    if "metadata_json" in update_data:
        flag_modified(course, "metadata_json")

    await db.commit()
    await db.refresh(course)

    res = await db.execute(
        select(Course)
        .options(
            selectinload(Course.category),
            selectinload(Course.instructor),
            selectinload(Course.sections).selectinload(CourseSection.lessons)
        )
        .where(Course.id == course.id)
    )
    c = res.scalar_one()

    sections_list = []
    total_lessons = 0
    for s in sorted(c.sections, key=lambda x: x.order_index):
        lessons_list = []
        for l in sorted(s.lessons, key=lambda x: x.order_index):
            total_lessons += 1
            lessons_list.append(LessonAdminResponse.model_validate(l))
        sections_list.append(
            CourseSectionAdminResponse(
                id=s.id,
                course_id=s.course_id,
                title=s.title,
                description=s.description,
                order_index=s.order_index,
                lessons=lessons_list
            )
        )

    return CourseAdminResponse(
        id=c.id,
        title=c.title,
        slug=c.slug,
        short_description=c.short_description,
        full_description=c.full_description,
        cover_image=c.cover_image,
        preview_video_url=c.preview_video_url,
        category_id=c.category_id,
        category_name=c.category.name if c.category else None,
        instructor_id=c.instructor_id,
        instructor_name=c.instructor.full_name if c.instructor else "Echipa NursLab",
        instructor_specialty=c.instructor.nursing_specialty if c.instructor else None,
        difficulty=c.difficulty,
        estimated_hours=c.estimated_hours,
        is_free=c.is_free,
        price=c.price,
        currency=c.currency,
        is_published=c.is_published,
        status=c.status,
        featured=c.featured,
        has_certificate=c.has_certificate,
        completion_threshold_percent=c.completion_threshold_percent,
        metadata_json=c.metadata_json or {},
        total_sections_count=len(sections_list),
        total_lessons_count=total_lessons,
        sections=sections_list,
        created_at=c.created_at,
        updated_at=c.updated_at
    )

@router.post("/{course_id}/duplicate", response_model=CourseAdminResponse)
async def duplicate_course(
    course_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    res = await db.execute(
        select(Course)
        .options(
            selectinload(Course.sections).selectinload(CourseSection.lessons)
        )
        .where(Course.id == course_id)
    )
    original = res.scalar_one_or_none()
    if not original:
        raise HTTPException(status_code=404, detail="Cursul original nu a fost găsit")

    new_title = f"{original.title} (Copie)"
    base_slug = f"{original.slug}-copie"
    slug = base_slug
    counter = 1
    while True:
        chk = await db.execute(select(Course).where(Course.slug == slug))
        if not chk.scalar_one_or_none():
            break
        slug = f"{base_slug}-{counter}"
        counter += 1

    duplicated = Course(
        title=new_title,
        slug=slug,
        short_description=original.short_description,
        full_description=original.full_description,
        cover_image=original.cover_image,
        preview_video_url=original.preview_video_url,
        category_id=original.category_id,
        instructor_id=original.instructor_id,
        difficulty=original.difficulty,
        estimated_hours=original.estimated_hours,
        is_free=original.is_free,
        price=original.price,
        currency=original.currency,
        is_published=False,
        status="draft",
        featured=False,
        has_certificate=original.has_certificate,
        completion_threshold_percent=original.completion_threshold_percent,
        metadata_json=dict(original.metadata_json or {})
    )
    db.add(duplicated)
    await db.flush()

    for sec in sorted(original.sections, key=lambda s: s.order_index):
        new_sec = CourseSection(
            course_id=duplicated.id,
            title=sec.title,
            description=sec.description,
            order_index=sec.order_index
        )
        db.add(new_sec)
        await db.flush()

        for les in sorted(sec.lessons, key=lambda l: l.order_index):
            new_les = Lesson(
                section_id=new_sec.id,
                title=les.title,
                slug=f"{les.slug}-copie-{counter}",
                description=les.description,
                lesson_type=les.lesson_type,
                video_url=les.video_url,
                duration_minutes=les.duration_minutes,
                is_preview=les.is_preview,
                order_index=les.order_index,
                is_published=les.is_published,
                content_markdown=les.content_markdown
            )
            db.add(new_les)

    await db.commit()

    # Load complete new course
    res = await db.execute(
        select(Course)
        .options(
            selectinload(Course.category),
            selectinload(Course.instructor),
            selectinload(Course.sections).selectinload(CourseSection.lessons)
        )
        .where(Course.id == duplicated.id)
    )
    c = res.scalar_one()

    sections_list = []
    total_lessons = 0
    for s in sorted(c.sections, key=lambda x: x.order_index):
        lessons_list = []
        for l in sorted(s.lessons, key=lambda x: x.order_index):
            total_lessons += 1
            lessons_list.append(LessonAdminResponse.model_validate(l))
        sections_list.append(
            CourseSectionAdminResponse(
                id=s.id,
                course_id=s.course_id,
                title=s.title,
                description=s.description,
                order_index=s.order_index,
                lessons=lessons_list
            )
        )

    return CourseAdminResponse(
        id=c.id,
        title=c.title,
        slug=c.slug,
        short_description=c.short_description,
        full_description=c.full_description,
        cover_image=c.cover_image,
        preview_video_url=c.preview_video_url,
        category_id=c.category_id,
        category_name=c.category.name if c.category else None,
        instructor_id=c.instructor_id,
        instructor_name=c.instructor.full_name if c.instructor else "Echipa NursLab",
        instructor_specialty=c.instructor.nursing_specialty if c.instructor else None,
        difficulty=c.difficulty,
        estimated_hours=c.estimated_hours,
        is_free=c.is_free,
        price=c.price,
        currency=c.currency,
        is_published=c.is_published,
        status=c.status,
        featured=c.featured,
        has_certificate=c.has_certificate,
        completion_threshold_percent=c.completion_threshold_percent,
        metadata_json=c.metadata_json or {},
        total_sections_count=len(sections_list),
        total_lessons_count=total_lessons,
        sections=sections_list,
        created_at=c.created_at,
        updated_at=c.updated_at
    )

@router.delete("/{course_id}")
async def delete_course(
    course_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    res = await db.execute(select(Course).where(Course.id == course_id))
    course = res.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Cursul nu a fost găsit")

    await db.delete(course)
    await db.commit()
    return {"status": "deleted", "id": course_id}

# ----------------- SECTION & LESSON CRUD -----------------

@router.post("/{course_id}/sections", response_model=CourseSectionAdminResponse, status_code=status.HTTP_201_CREATED)
async def create_section(
    course_id: str,
    sec_in: CourseSectionCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    course_res = await db.execute(select(Course).where(Course.id == course_id))
    if not course_res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Cursul nu a fost găsit")

    section = CourseSection(
        course_id=course_id,
        title=sec_in.title,
        description=sec_in.description,
        order_index=sec_in.order_index or 0
    )
    db.add(section)
    await db.commit()
    await db.refresh(section)

    return CourseSectionAdminResponse(
        id=section.id,
        course_id=section.course_id,
        title=section.title,
        description=section.description,
        order_index=section.order_index,
        lessons=[]
    )

@router.put("/sections/{section_id}", response_model=CourseSectionAdminResponse)
async def update_section(
    section_id: str,
    sec_in: CourseSectionUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    res = await db.execute(
        select(CourseSection)
        .options(selectinload(CourseSection.lessons))
        .where(CourseSection.id == section_id)
    )
    section = res.scalar_one_or_none()
    if not section:
        raise HTTPException(status_code=404, detail="Secțiunea nu a fost găsită")

    update_data = sec_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(section, field, val)

    await db.commit()
    await db.refresh(section)

    return CourseSectionAdminResponse(
        id=section.id,
        course_id=section.course_id,
        title=section.title,
        description=section.description,
        order_index=section.order_index,
        lessons=[LessonAdminResponse.model_validate(l) for l in sorted(section.lessons, key=lambda x: x.order_index)]
    )

@router.delete("/sections/{section_id}")
async def delete_section(
    section_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    res = await db.execute(select(CourseSection).where(CourseSection.id == section_id))
    section = res.scalar_one_or_none()
    if not section:
        raise HTTPException(status_code=404, detail="Secțiunea nu a fost găsită")

    await db.delete(section)
    await db.commit()
    return {"status": "deleted", "id": section_id}

@router.post("/sections/{section_id}/lessons", response_model=LessonAdminResponse, status_code=status.HTTP_201_CREATED)
async def create_lesson(
    section_id: str,
    les_in: LessonCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    sec_res = await db.execute(select(CourseSection).where(CourseSection.id == section_id))
    if not sec_res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Secțiunea nu a fost găsită")

    slug = les_in.slug
    if not slug:
        slug = re.sub(r'[^a-z0-9]+', '-', les_in.title.lower()).strip('-')

    lesson = Lesson(
        section_id=section_id,
        title=les_in.title,
        slug=slug,
        description=les_in.description,
        lesson_type=les_in.lesson_type,
        video_url=les_in.video_url,
        duration_minutes=les_in.duration_minutes,
        is_preview=les_in.is_preview,
        order_index=les_in.order_index or 0,
        is_published=les_in.is_published,
        content_markdown=les_in.content_markdown
    )
    db.add(lesson)
    await db.commit()
    await db.refresh(lesson)
    return LessonAdminResponse.model_validate(lesson)

@router.put("/lessons/{lesson_id}", response_model=LessonAdminResponse)
async def update_lesson(
    lesson_id: str,
    les_in: LessonUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    res = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    lesson = res.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lecția nu a fost găsită")

    update_data = les_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(lesson, field, val)

    await db.commit()
    await db.refresh(lesson)
    return LessonAdminResponse.model_validate(lesson)

@router.delete("/lessons/{lesson_id}")
async def delete_lesson(
    lesson_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    res = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    lesson = res.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lecția nu a fost găsită")

    await db.delete(lesson)
    await db.commit()
    return {"status": "deleted", "id": lesson_id}

# ----------------- PUBLIC ENDPOINTS -----------------

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
        clean_phrase = " ".join(search.split())
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
            status=c.status,
            featured=c.featured,
            has_certificate=c.has_certificate,
            total_lessons_count=0,
            metadata_json=c.metadata_json or {}
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
        status=course.status,
        featured=course.featured,
        has_certificate=course.has_certificate,
        completion_threshold_percent=course.completion_threshold_percent,
        sections=sections_data,
        is_enrolled=is_enrolled,
        progress_percent=progress_percent,
        metadata_json=course.metadata_json or {}
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
