from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class SpeakerCreate(BaseModel):
    full_name: str
    title: str
    hospital: Optional[str] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None

class SpeakerUpdate(BaseModel):
    full_name: Optional[str] = None
    title: Optional[str] = None
    hospital: Optional[str] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None

class SpeakerResponse(BaseModel):
    id: str
    full_name: str
    title: str
    hospital: Optional[str] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    metadata_json: Dict[str, Any] = {}

    class Config:
        from_attributes = True

class WebinarCreate(BaseModel):
    title: str
    slug: Optional[str] = None
    description: str
    webinar_type: str = "live" # live, interview, discussion
    badge: str = "LIVE"
    scheduled_at: datetime
    duration_minutes: int = 60
    cover_image: Optional[str] = None
    speaker_id: Optional[str] = None
    is_free: bool = True
    recording_url: Optional[str] = None
    is_published: bool = True
    metadata_json: Optional[Dict[str, Any]] = None

class WebinarUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    webinar_type: Optional[str] = None
    badge: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    cover_image: Optional[str] = None
    speaker_id: Optional[str] = None
    is_free: Optional[bool] = None
    recording_url: Optional[str] = None
    is_published: Optional[bool] = None
    metadata_json: Optional[Dict[str, Any]] = None

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
    is_published: Optional[bool] = True
    metadata_json: Dict[str, Any] = {}

    class Config:
        from_attributes = True

class SpeakerDetailResponse(SpeakerResponse):
    webinars: List[WebinarResponse] = []

class WebinarRegisterRequest(BaseModel):
    webinar_id: str
