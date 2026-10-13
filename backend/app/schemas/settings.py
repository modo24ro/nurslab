from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, EmailStr

class SettingItem(BaseModel):
    id: Optional[str] = None
    setting_key: str
    setting_value: str
    description: Optional[str] = None
    category: Optional[str] = "general"
    is_secret: bool = False

    class Config:
        from_attributes = True

class SettingsBulkUpdate(BaseModel):
    settings: Dict[str, str]

class CategoryAdminResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None
    display_order: int = 0
    is_active: bool = True
    courses_count: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CategoryCreate(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    display_order: Optional[int] = 0
    is_active: Optional[bool] = True

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None

class TestEmailRequest(BaseModel):
    to_email: str
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_encryption: Optional[str] = None  # 'tls', 'ssl', 'none'
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_from_name: Optional[str] = None
    smtp_from_email: Optional[str] = None

class TestPaymentRequest(BaseModel):
    stripe_secret_key: Optional[str] = None
    stripe_mode: Optional[str] = None
