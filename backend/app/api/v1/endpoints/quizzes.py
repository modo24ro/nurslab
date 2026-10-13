import uuid
import hashlib
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.quiz import Quiz, QuizQuestion, QuizOption, QuizAttempt
from app.models.course import Lesson, CourseSection, Course
from app.models.certificate import Certificate
from app.models.user import User
from app.schemas.quiz import (
    QuizPublicResponse, QuizSubmission, QuizResultResponse, QuestionFeedback
)
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/by-lesson/{lesson_id}", response_model=QuizPublicResponse)
async def get_quiz_by_lesson(
    lesson_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = (
        select(Quiz)
        .options(
            selectinload(Quiz.questions).selectinload(QuizQuestion.options)
        )
        .where(Quiz.lesson_id == lesson_id)
    )
    res = await db.execute(query)
    quiz = res.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Nu există test pentru această lecție")

    return QuizPublicResponse.model_validate(quiz)

@router.post("/{quiz_id}/submit", response_model=QuizResultResponse)
async def submit_quiz(
    quiz_id: str,
    submission: QuizSubmission,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = (
        select(Quiz)
        .options(
            selectinload(Quiz.questions).selectinload(QuizQuestion.options),
            selectinload(Quiz.lesson).selectinload(Lesson.section).selectinload(CourseSection.course)
        )
        .where(Quiz.id == quiz_id)
    )
    res = await db.execute(query)
    quiz = res.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Test inexistent")

    # Evaluate submission
    submitted_answers_map = {ans.question_id: ans.selected_option_id for ans in submission.answers}
    total_questions = len(quiz.questions)
    correct_count = 0
    feedback_list = []

    for q in quiz.questions:
        selected_option_id = submitted_answers_map.get(q.id)
        correct_option = next((opt for opt in q.options if opt.is_correct), None)
        correct_id = correct_option.id if correct_option else ""
        
        is_correct = bool(selected_option_id and selected_option_id == correct_id)
        if is_correct:
            correct_count += 1

        feedback_list.append(
            QuestionFeedback(
                question_id=q.id,
                is_correct=is_correct,
                explanation=q.explanation,
                correct_option_id=correct_id
            )
        )

    score_percent = int((correct_count / total_questions) * 100) if total_questions > 0 else 0
    passed = score_percent >= quiz.passing_score_percent

    # Count prior attempts
    attempts_res = await db.execute(
        select(QuizAttempt).where(
            QuizAttempt.quiz_id == quiz.id,
            QuizAttempt.user_id == current_user.id
        )
    )
    prior_attempts = len(attempts_res.scalars().all())

    attempt = QuizAttempt(
        quiz_id=quiz.id,
        user_id=current_user.id,
        score_percent=score_percent,
        passed=passed,
        attempt_number=prior_attempts + 1
    )
    db.add(attempt)

    certificate_generated = False
    certificate_code = None

    if passed:
        # Check course certificate
        course = quiz.lesson.section.course
        if course and course.has_certificate:
            cert_res = await db.execute(
                select(Certificate).where(
                    Certificate.user_id == current_user.id,
                    Certificate.course_id == course.id
                )
            )
            existing_cert = cert_res.scalar_one_or_none()
            if not existing_cert:
                cert_code = f"NLB-2026-{uuid.uuid4().hex[:8].upper()}"
                verification_hash = hashlib.sha256(f"{current_user.id}:{course.id}:{cert_code}".encode()).hexdigest()
                new_cert = Certificate(
                    certificate_code=cert_code,
                    user_id=current_user.id,
                    course_id=course.id,
                    student_name=current_user.full_name,
                    course_title=course.title,
                    instructor_name="Echipa NursLab & Formatori Atestați",
                    verification_hash=verification_hash,
                    issue_date=datetime.now(timezone.utc)
                )
                db.add(new_cert)
                certificate_generated = True
                certificate_code = cert_code

    await db.commit()

    return QuizResultResponse(
        quiz_id=quiz.id,
        score_percent=score_percent,
        passed=passed,
        passing_score_percent=quiz.passing_score_percent,
        attempt_number=prior_attempts + 1,
        feedback=feedback_list,
        certificate_generated=certificate_generated,
        certificate_code=certificate_code
    )
