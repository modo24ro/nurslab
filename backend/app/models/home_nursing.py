from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid

class HomeNursingService(Base, TimestampMixin):
    __tablename__ = "home_nursing_services"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    price_estimate = Column(String(100), nullable=True)
    icon = Column(String(50), default="heart", nullable=False)
    display_order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

class HomeNursingRequest(Base, TimestampMixin):
    __tablename__ = "home_nursing_requests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    address = Column(String(500), nullable=False)
    city = Column(String(100), nullable=False)
    service_type = Column(String(255), nullable=False)
    patient_condition = Column(Text, nullable=True)
    urgency_level = Column(String(50), default="normal", nullable=False) # normal, urgent
    preferred_date = Column(String(100), nullable=True)
    status = Column(String(50), default="pending", nullable=False) # pending, contacted, scheduled, completed
    admin_notes = Column(Text, nullable=True)
