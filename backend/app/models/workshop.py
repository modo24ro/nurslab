from sqlalchemy import Column, String, Integer, Boolean, Text
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid

class WorkshopCity(Base, TimestampMixin):
    __tablename__ = "workshop_cities"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False)
    county = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    display_order = Column(Integer, default=0, nullable=False)

class WorkshopTopic(Base, TimestampMixin):
    __tablename__ = "workshop_topics"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), unique=True, nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    display_order = Column(Integer, default=0, nullable=False)

class WorkshopInterestRegistration(Base, TimestampMixin):
    __tablename__ = "workshop_interest_registrations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    city_name = Column(String(100), nullable=False)
    topic_title = Column(String(255), nullable=False)
    notes = Column(Text, nullable=True)
    status = Column(String(50), default="new", nullable=False) # new, contacted, enrolled
