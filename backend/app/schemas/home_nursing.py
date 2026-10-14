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
    admin_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class HomeNursingRequestAdminCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    address: str
    city: str
    service_type: str
    patient_condition: Optional[str] = None
    urgency_level: str = "normal"
    preferred_date: Optional[str] = None
    status: str = "pending"
    admin_notes: Optional[str] = None

class HomeNursingRequestAdminUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    service_type: Optional[str] = None
    patient_condition: Optional[str] = None
    urgency_level: Optional[str] = None
    preferred_date: Optional[str] = None
    status: Optional[str] = None
    admin_notes: Optional[str] = None

