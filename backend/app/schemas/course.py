from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel
from app.models.course import CourseDifficulty, LessonType

class CategoryResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None
    display_order: int

    class Config:
        from_attributes = True

class LessonResourceResponse(BaseModel):
    id: str
    title: str
    file_url: str
    file_type: str
    file_size_bytes: int

    class Config:
        from_attributes = True

class LessonSummaryResponse(BaseModel):
    id: str
    title: str
    slug: str
    lesson_type: LessonType
    duration_minutes: int
    is_preview: bool
    order_index: int
    has_quiz: Optional[bool] = False

    class Config:
        from_attributes = True

class SectionSummaryResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    order_index: int
    lessons: List[LessonSummaryResponse] = []

    class Config:
        from_attributes = True

class CourseResponse(BaseModel):
    id: str
    title: str
    slug: str
    short_description: str
    cover_image: Optional[str] = None
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    instructor_name: Optional[str] = None
    difficulty: CourseDifficulty
    estimated_hours: int
    is_free: bool
    price: Decimal
    currency: str
    is_published: bool
    featured: bool
    has_certificate: bool
    total_lessons_count: Optional[int] = 0

    class Config:
        from_attributes = True

class CourseDetailResponse(BaseModel):
    id: str
    title: str
    slug: str
    short_description: str
    full_description: str
    cover_image: Optional[str] = None
    preview_video_url: Optional[str] = None
    category_id: Optional[str] = None
    category: Optional[CategoryResponse] = None
    instructor_id: Optional[str] = None
    instructor_name: Optional[str] = None
    instructor_specialty: Optional[str] = None
    difficulty: CourseDifficulty
    estimated_hours: int
    is_free: bool
    price: Decimal
    currency: str
    is_published: bool
    featured: bool
    has_certificate: bool
    completion_threshold_percent: int
    sections: List[SectionSummaryResponse] = []
    is_enrolled: Optional[bool] = False
    progress_percent: Optional[int] = 0

    class Config:
        from_attributes = True

class LessonDetailResponse(BaseModel):
    id: str
    section_id: str
    course_id: str
    course_title: str
    title: str
    slug: str
    description: Optional[str] = None
    lesson_type: LessonType
    video_url: Optional[str] = None
    duration_minutes: int
    is_preview: bool
    order_index: int
    content_markdown: Optional[str] = None
    resources: List[LessonResourceResponse] = []
    is_completed: Optional[bool] = False
    last_position_seconds: Optional[int] = 0
    next_lesson_id: Optional[str] = None
    prev_lesson_id: Optional[str] = None

    class Config:
        from_attributes = True

class CourseCreate(BaseModel):
    title: str
    slug: str
    short_description: str
    full_description: str
    category_id: Optional[str] = None
    difficulty: CourseDifficulty = CourseDifficulty.BEGINNER
    estimated_hours: int = 5
    is_free: bool = False
    price: Decimal = Decimal("0.00")
    currency: str = "RON"
    is_published: bool = False
    featured: bool = False
    has_certificate: bool = True
    cover_image: Optional[str] = None
    preview_video_url: Optional[str] = None

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    short_description: Optional[str] = None
    full_description: Optional[str] = None
    category_id: Optional[str] = None
    difficulty: Optional[CourseDifficulty] = None
    estimated_hours: Optional[int] = None
    is_free: Optional[bool] = None
    price: Optional[Decimal] = None
    is_published: Optional[bool] = None
    featured: Optional[bool] = None
    cover_image: Optional[str] = None
