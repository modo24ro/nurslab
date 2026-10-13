from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.progress import LessonProgress, CourseEnrollment, Note, Bookmark
from app.models.course import Lesson, CourseSection, Course
from app.models.certificate import Certificate
from app.models.payment import Subscription, SubscriptionStatus
from app.models.user import User
from app.schemas.progress import (
    ProgressUpdate, NoteCreate, NoteResponse,
    BookmarkCreate, BookmarkResponse, StudentDashboardStats, EnrolledCourseItem
)
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/lesson/{lesson_id}")
async def update_lesson_progress(
    lesson_id: str,
    update_in: ProgressUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify lesson exists
    les_res = await db.execute(
        select(Lesson)
        .options(selectinload(Lesson.section).selectinload(CourseSection.course))
        .where(Lesson.id == lesson_id)
    )
    lesson = les_res.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lecție inexistentă")

    course = lesson.section.course

    # Upsert LessonProgress
    prog_res = await db.execute(
        select(LessonProgress).where(
            LessonProgress.user_id == current_user.id,
            LessonProgress.lesson_id == lesson.id
        )
    )
    prog = prog_res.scalar_one_or_none()
    if not prog:
        prog = LessonProgress(
            user_id=current_user.id,
            lesson_id=lesson.id,
            is_completed=update_in.is_completed,
            last_position_seconds=update_in.last_position_seconds,
            completed_at=datetime.now(timezone.utc) if update_in.is_completed else None
        )
        db.add(prog)
    else:
        prog.last_position_seconds = update_in.last_position_seconds
        if update_in.is_completed and not prog.is_completed:
            prog.is_completed = True
            prog.completed_at = datetime.now(timezone.utc)
        elif not update_in.is_completed and prog.is_completed:
            prog.is_completed = False

    await db.flush()

    # Calculate overall progress for course
    # Total lessons in course
    total_lessons_res = await db.execute(
        select(func.count(Lesson.id))
        .join(CourseSection, Lesson.section_id == CourseSection.id)
        .where(CourseSection.course_id == course.id)
    )
    total_lessons = total_lessons_res.scalar() or 1

    # Completed lessons in course for this user
    completed_lessons_res = await db.execute(
        select(func.count(LessonProgress.id))
        .join(Lesson, LessonProgress.lesson_id == Lesson.id)
        .join(CourseSection, Lesson.section_id == CourseSection.id)
        .where(
            CourseSection.course_id == course.id,
            LessonProgress.user_id == current_user.id,
            LessonProgress.is_completed == True
        )
    )
    completed_lessons = completed_lessons_res.scalar() or 0

    progress_percent = min(100, int((completed_lessons / total_lessons) * 100))

    # Update CourseEnrollment
    enr_res = await db.execute(
        select(CourseEnrollment).where(
            CourseEnrollment.user_id == current_user.id,
            CourseEnrollment.course_id == course.id
        )
    )
    enrollment = enr_res.scalar_one_or_none()
    if not enrollment:
        enrollment = CourseEnrollment(
            user_id=current_user.id,
            course_id=course.id,
            progress_percent=progress_percent,
            is_completed=progress_percent >= course.completion_threshold_percent,
            completed_at=datetime.now(timezone.utc) if progress_percent >= course.completion_threshold_percent else None
        )
        db.add(enrollment)
    else:
        enrollment.progress_percent = progress_percent
        if progress_percent >= course.completion_threshold_percent and not enrollment.is_completed:
            enrollment.is_completed = True
            enrollment.completed_at = datetime.now(timezone.utc)

    await db.commit()
    return {
        "status": "updated",
        "lesson_id": lesson.id,
        "is_completed": prog.is_completed,
        "course_progress_percent": progress_percent
    }

@router.get("/dashboard", response_model=StudentDashboardStats)
async def get_student_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Enrollments
    enr_res = await db.execute(
        select(CourseEnrollment)
        .options(selectinload(CourseEnrollment.course))
        .where(CourseEnrollment.user_id == current_user.id)
        .order_by(CourseEnrollment.updated_at.desc())
    )
    enrollments = enr_res.scalars().all()

    total_enrolled = len(enrollments)
    completed_courses = sum(1 for e in enrollments if e.is_completed)

    # Certificates
    cert_res = await db.execute(
        select(func.count(Certificate.id)).where(Certificate.user_id == current_user.id)
    )
    certs_count = cert_res.scalar() or 0

    # Active subscriptions
    sub_res = await db.execute(
        select(func.count(Subscription.id)).where(
            Subscription.user_id == current_user.id,
            Subscription.status == SubscriptionStatus.ACTIVE
        )
    )
    active_subs = sub_res.scalar() or 0

    in_progress = []
    for e in enrollments:
        if e.course:
            in_progress.append(
                EnrolledCourseItem(
                    course_id=e.course_id,
                    course_title=e.course.title,
                    course_slug=e.course.slug,
                    cover_image=e.course.cover_image,
                    progress_percent=e.progress_percent,
                    is_completed=e.is_completed,
                    enrolled_at=e.enrolled_at,
                    completed_at=e.completed_at
                )
            )

    return StudentDashboardStats(
        total_enrolled=total_enrolled,
        completed_courses=completed_courses,
        certificates_earned=certs_count,
        active_subscriptions=active_subs,
        in_progress_courses=in_progress
    )

@router.post("/notes", response_model=NoteResponse)
async def create_note(
    note_in: NoteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    note = Note(
        user_id=current_user.id,
        lesson_id=note_in.lesson_id,
        timestamp_seconds=note_in.timestamp_seconds,
        content=note_in.content
    )
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return NoteResponse.model_validate(note)

@router.get("/notes/{lesson_id}", response_model=List[NoteResponse])
async def get_lesson_notes(
    lesson_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(
        select(Note).where(
            Note.user_id == current_user.id,
            Note.lesson_id == lesson_id
        ).order_by(Note.timestamp_seconds)
    )
    return [NoteResponse.model_validate(n) for n in res.scalars().all()]
