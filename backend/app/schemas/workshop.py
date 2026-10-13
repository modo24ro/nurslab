from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

class WorkshopCityResponse(BaseModel):
    id: str
    name: str
    county: Optional[str] = None
    display_order: int

    class Config:
        from_attributes = True

class WorkshopTopicResponse(BaseModel):
    id: str
    title: str
    slug: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class WorkshopInterestCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    city_name: str
    topic_title: str
    notes: Optional[str] = None

class WorkshopInterestResponse(BaseModel):
    id: str
    full_name: str
    email: str
    phone: str
    city_name: str
    topic_title: str
    notes: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
