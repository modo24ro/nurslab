import enum
from sqlalchemy import Column, String, Integer, Numeric, Boolean, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid

class CourseDifficulty(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

class LessonType(str, enum.Enum):
    VIDEO = "video"
    ARTICLE = "article"
    QUIZ = "quiz"
    WORKSHOP = "workshop"

class Category(Base, TimestampMixin):
    __tablename__ = "categories"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(String(500), nullable=True)
    icon = Column(String(50), nullable=True)
    display_order = Column(Integer, default=0, nullable=False)

    courses = relationship("Course", back_populates="category", cascade="all, delete-orphan")

class Course(Base, TimestampMixin):
    __tablename__ = "courses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    short_description = Column(String(500), nullable=False)
    full_description = Column(Text, nullable=False)
    cover_image = Column(String(500), nullable=True)
    preview_video_url = Column(String(500), nullable=True)
    instructor_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    category_id = Column(String(36), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    difficulty = Column(Enum(CourseDifficulty), default=CourseDifficulty.BEGINNER, nullable=False)
    estimated_hours = Column(Integer, default=5, nullable=False)
    is_free = Column(Boolean, default=False, nullable=False)
    price = Column(Numeric(10, 2), default=0.00, nullable=False)
    currency = Column(String(10), default="RON", nullable=False)
    is_published = Column(Boolean, default=False, nullable=False)
    featured = Column(Boolean, default=False, nullable=False)
    has_certificate = Column(Boolean, default=True, nullable=False)
    completion_threshold_percent = Column(Integer, default=80, nullable=False)

    category = relationship("Category", back_populates="courses")
    instructor = relationship("User", foreign_keys=[instructor_id])
    sections = relationship("CourseSection", back_populates="course", cascade="all, delete-orphan", order_by="CourseSection.order_index")

class CourseSection(Base, TimestampMixin):
    __tablename__ = "course_sections"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String(500), nullable=True)
    order_index = Column(Integer, default=0, nullable=False)

    course = relationship("Course", back_populates="sections")
    lessons = relationship("Lesson", back_populates="section", cascade="all, delete-orphan", order_by="Lesson.order_index")

class Lesson(Base, TimestampMixin):
    __tablename__ = "lessons"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    section_id = Column(String(36), ForeignKey("course_sections.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False)
    description = Column(String(500), nullable=True)
    lesson_type = Column(Enum(LessonType), default=LessonType.VIDEO, nullable=False)
    video_url = Column(String(500), nullable=True)
    duration_minutes = Column(Integer, default=15, nullable=False)
    is_preview = Column(Boolean, default=False, nullable=False)
    order_index = Column(Integer, default=0, nullable=False)
    content_markdown = Column(Text, nullable=True)

    section = relationship("CourseSection", back_populates="lessons")
    resources = relationship("LessonResource", back_populates="lesson", cascade="all, delete-orphan")

class LessonResource(Base, TimestampMixin):
    __tablename__ = "lesson_resources"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    lesson_id = Column(String(36), ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    file_type = Column(String(50), default="pdf", nullable=False)
    file_size_bytes = Column(Integer, default=0, nullable=False)

    lesson = relationship("Lesson", back_populates="resources")
