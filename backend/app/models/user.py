import enum
from sqlalchemy import Column, String, Boolean, Enum
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid

class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    CONTENT_EDITOR = "content_editor"
    INSTRUCTOR = "instructor"
    STUDENT = "student"

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.STUDENT, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=True, nullable=False)
    phone = Column(String(50), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    hospital_affiliation = Column(String(255), nullable=True)
    nursing_specialty = Column(String(255), nullable=True)
    bio = Column(String(1000), nullable=True)
