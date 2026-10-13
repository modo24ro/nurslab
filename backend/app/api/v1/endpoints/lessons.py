from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.course import Lesson, CourseSection, Course
from app.models.payment import Entitlement, EntitlementType
from app.models.progress import LessonProgress
from app.models.user import User, UserRole
from app.schemas.course import LessonDetailResponse, LessonResourceResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/{lesson_id}", response_model=LessonDetailResponse)
async def get_lesson_detail(
    lesson_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = (
        select(Lesson)
        .options(
            selectinload(Lesson.section).selectinload(CourseSection.course),
            selectinload(Lesson.resources)
        )
        .where(Lesson.id == lesson_id)
    )
    res = await db.execute(query)
    lesson = res.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lecția nu a fost găsită")

    course = lesson.section.course

    # Check access entitlements if course is not free and lesson is not preview
    if not course.is_free and not lesson.is_preview and current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
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
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Nu aveți acces la această lecție. Cursul necesită achiziție sau abonament activ."
            )

    # Fetch progress for this user
    prog_res = await db.execute(
        select(LessonProgress).where(
            LessonProgress.user_id == current_user.id,
            LessonProgress.lesson_id == lesson.id
        )
    )
    progress = prog_res.scalar_one_or_none()

    # Find prev and next lesson in course
    sections_res = await db.execute(
        select(CourseSection)
        .options(selectinload(CourseSection.lessons))
        .where(CourseSection.course_id == course.id)
        .order_by(CourseSection.order_index)
    )
    all_sections = sections_res.scalars().all()
    all_lessons = []
    for s in all_sections:
        for l in sorted(s.lessons, key=lambda x: x.order_index):
            all_lessons.append(l)

    current_idx = -1
    for idx, l in enumerate(all_lessons):
        if l.id == lesson.id:
            current_idx = idx
            break

    prev_id = all_lessons[current_idx - 1].id if current_idx > 0 else None
    next_id = all_lessons[current_idx + 1].id if current_idx != -1 and current_idx < len(all_lessons) - 1 else None

    return LessonDetailResponse(
        id=lesson.id,
        section_id=lesson.section_id,
        course_id=course.id,
        course_title=course.title,
        title=lesson.title,
        slug=lesson.slug,
        description=lesson.description,
        lesson_type=lesson.lesson_type,
        video_url=lesson.video_url,
        duration_minutes=lesson.duration_minutes,
        is_preview=lesson.is_preview,
        order_index=lesson.order_index,
        content_markdown=lesson.content_markdown,
        resources=[LessonResourceResponse.model_validate(r) for r in lesson.resources],
        is_completed=progress.is_completed if progress else False,
        last_position_seconds=progress.last_position_seconds if progress else 0,
        next_lesson_id=next_id,
        prev_lesson_id=prev_id,
    )
