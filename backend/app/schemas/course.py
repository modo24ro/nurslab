from typing import Optional, List, Dict, Any
from decimal import Decimal
from datetime import datetime
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
    is_published: Optional[bool] = True

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
    status: Optional[str] = "published"
    featured: bool
    has_certificate: bool
    total_lessons_count: Optional[int] = 0
    metadata_json: Dict[str, Any] = {}

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
    status: Optional[str] = "published"
    featured: bool
    has_certificate: bool
    completion_threshold_percent: int
    sections: List[SectionSummaryResponse] = []
    is_enrolled: Optional[bool] = False
    progress_percent: Optional[int] = 0
    metadata_json: Dict[str, Any] = {}

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
    is_published: Optional[bool] = True
    content_markdown: Optional[str] = None
    resources: List[LessonResourceResponse] = []
    is_completed: Optional[bool] = False
    last_position_seconds: Optional[int] = 0
    next_lesson_id: Optional[str] = None
    prev_lesson_id: Optional[str] = None

    class Config:
        from_attributes = True

class LessonCreate(BaseModel):
    title: str
    slug: Optional[str] = None
    description: Optional[str] = None
    lesson_type: LessonType = LessonType.VIDEO
    video_url: Optional[str] = None
    duration_minutes: int = 15
    is_preview: bool = False
    order_index: Optional[int] = 0
    is_published: bool = True
    content_markdown: Optional[str] = None

class LessonUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    lesson_type: Optional[LessonType] = None
    video_url: Optional[str] = None
    duration_minutes: Optional[int] = None
    is_preview: Optional[bool] = None
    order_index: Optional[int] = None
    is_published: Optional[bool] = None
    content_markdown: Optional[str] = None

class LessonAdminResponse(BaseModel):
    id: str
    section_id: str
    title: str
    slug: str
    description: Optional[str] = None
    lesson_type: LessonType
    video_url: Optional[str] = None
    duration_minutes: int
    is_preview: bool
    order_index: int
    is_published: bool
    content_markdown: Optional[str] = None

    class Config:
        from_attributes = True

class CourseSectionCreate(BaseModel):
    title: str
    description: Optional[str] = None
    order_index: Optional[int] = 0

class CourseSectionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order_index: Optional[int] = None

class CourseSectionAdminResponse(BaseModel):
    id: str
    course_id: str
    title: str
    description: Optional[str] = None
    order_index: int
    lessons: List[LessonAdminResponse] = []

    class Config:
        from_attributes = True

class CourseCreate(BaseModel):
    title: str
    slug: Optional[str] = None
    short_description: str
    full_description: str
    category_id: Optional[str] = None
    instructor_id: Optional[str] = None
    difficulty: CourseDifficulty = CourseDifficulty.BEGINNER
    estimated_hours: int = 5
    is_free: bool = False
    price: Decimal = Decimal("0.00")
    currency: str = "RON"
    is_published: bool = False
    status: str = "draft"
    featured: bool = False
    has_certificate: bool = True
    completion_threshold_percent: int = 80
    cover_image: Optional[str] = None
    preview_video_url: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    short_description: Optional[str] = None
    full_description: Optional[str] = None
    category_id: Optional[str] = None
    instructor_id: Optional[str] = None
    difficulty: Optional[CourseDifficulty] = None
    estimated_hours: Optional[int] = None
    is_free: Optional[bool] = None
    price: Optional[Decimal] = None
    currency: Optional[str] = None
    is_published: Optional[bool] = None
    status: Optional[str] = None
    featured: Optional[bool] = None
    has_certificate: Optional[bool] = None
    completion_threshold_percent: Optional[int] = None
    cover_image: Optional[str] = None
    preview_video_url: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None

class CourseAdminResponse(BaseModel):
    id: str
    title: str
    slug: str
    short_description: str
    full_description: str
    cover_image: Optional[str] = None
    preview_video_url: Optional[str] = None
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    instructor_id: Optional[str] = None
    instructor_name: Optional[str] = None
    instructor_specialty: Optional[str] = None
    difficulty: CourseDifficulty
    estimated_hours: int
    is_free: bool
    price: Decimal
    currency: str
    is_published: bool
    status: str
    featured: bool
    has_certificate: bool
    completion_threshold_percent: int
    metadata_json: Dict[str, Any] = {}
    total_sections_count: int = 0
    total_lessons_count: int = 0
    sections: List[CourseSectionAdminResponse] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class InstructorOptionResponse(BaseModel):
    id: str
    full_name: str
    email: str
    specialty: Optional[str] = None

    class Config:
        from_attributes = True

