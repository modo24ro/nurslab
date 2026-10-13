from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid

class Speaker(Base, TimestampMixin):
    __tablename__ = "speakers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    full_name = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    hospital = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    photo_url = Column(String(500), nullable=True)

    webinars = relationship("Webinar", back_populates="speaker")

class Webinar(Base, TimestampMixin):
    __tablename__ = "webinars"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)
    webinar_type = Column(String(50), default="live", nullable=False) # interview, live, discussion
    badge = Column(String(50), default="LIVE", nullable=False)
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer, default=60, nullable=False)
    cover_image = Column(String(500), nullable=True)
    speaker_id = Column(String(36), ForeignKey("speakers.id", ondelete="SET NULL"), nullable=True, index=True)
    is_free = Column(Boolean, default=True, nullable=False)
    recording_url = Column(String(500), nullable=True)
    is_published = Column(Boolean, default=True, nullable=False)

    speaker = relationship("Speaker", back_populates="webinars")
    registrations = relationship("WebinarRegistration", back_populates="webinar", cascade="all, delete-orphan")

class WebinarRegistration(Base, TimestampMixin):
    __tablename__ = "webinar_registrations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    webinar_id = Column(String(36), ForeignKey("webinars.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    registered_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    webinar = relationship("Webinar", back_populates="registrations")
    user = relationship("User")
