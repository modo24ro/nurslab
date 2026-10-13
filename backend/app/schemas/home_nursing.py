from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

class HomeNursingServiceResponse(BaseModel):
    id: str
    title: str
    description: str
    price_estimate: Optional[str] = None
    icon: str
    display_order: int

    class Config:
        from_attributes = True

class HomeNursingRequestCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    address: str
    city: str
    service_type: str
    patient_condition: Optional[str] = None
    urgency_level: str = "normal"
    preferred_date: Optional[str] = None

class HomeNursingRequestResponse(BaseModel):
    id: str
    full_name: str
    email: str
    phone: str
    address: str
    city: str
    service_type: str
    patient_condition: Optional[str] = None
    urgency_level: str
    preferred_date: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
