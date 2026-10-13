from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class ProgressUpdate(BaseModel):
    is_completed: bool = False
    last_position_seconds: int = 0

class NoteCreate(BaseModel):
    lesson_id: str
    timestamp_seconds: int = 0
    content: str

class NoteResponse(BaseModel):
    id: str
    lesson_id: str
    timestamp_seconds: int
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class BookmarkCreate(BaseModel):
    lesson_id: str

class BookmarkResponse(BaseModel):
    id: str
    lesson_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class EnrolledCourseItem(BaseModel):
    course_id: str
    course_title: str
    course_slug: str
    cover_image: Optional[str] = None
    progress_percent: int
    is_completed: bool
    enrolled_at: datetime
    completed_at: Optional[datetime] = None

class StudentDashboardStats(BaseModel):
    total_enrolled: int
    completed_courses: int
    certificates_earned: int
    active_subscriptions: int
    in_progress_courses: List[EnrolledCourseItem] = []
