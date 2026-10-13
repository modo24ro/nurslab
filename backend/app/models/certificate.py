from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid

class Certificate(Base, TimestampMixin):
    __tablename__ = "certificates"
    __table_args__ = (UniqueConstraint("user_id", "course_id", name="uq_user_course_certificate"),)

    id = Column(String(36), primary_key=True, default=generate_uuid)
    certificate_code = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    student_name = Column(String(255), nullable=False)
    course_title = Column(String(255), nullable=False)
    instructor_name = Column(String(255), nullable=False)
    issue_date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    pdf_url = Column(String(500), nullable=True)
    verification_hash = Column(String(64), nullable=False)

    user = relationship("User")
    course = relationship("Course")
