from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class SpeakerResponse(BaseModel):
    id: str
    full_name: str
    title: str
    hospital: Optional[str] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = None

    class Config:
        from_attributes = True

class WebinarResponse(BaseModel):
    id: str
    title: str
    slug: str
    description: str
    webinar_type: str
    badge: str
    scheduled_at: datetime
    duration_minutes: int
    cover_image: Optional[str] = None
    speaker: Optional[SpeakerResponse] = None
    is_free: bool
    recording_url: Optional[str] = None
    is_registered: Optional[bool] = False

    class Config:
        from_attributes = True

class WebinarRegisterRequest(BaseModel):
    webinar_id: str
