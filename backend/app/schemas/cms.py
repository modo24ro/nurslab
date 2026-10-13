from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class CMSContentBlockResponse(BaseModel):
    id: str
    section_key: str
    block_key: str
    title: str
    content: Optional[str] = None
    image_url: Optional[str] = None
    link_label: Optional[str] = None
    link_url: Optional[str] = None
    badge: Optional[str] = None
    badge_variant: str = "mint"
    icon: Optional[str] = None
    display_order: int
    is_active: bool
    metadata_json: Dict[str, Any] = {}

    class Config:
        from_attributes = True

class CMSContentBlockUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    link_label: Optional[str] = None
    link_url: Optional[str] = None
    badge: Optional[str] = None
    badge_variant: Optional[str] = None
    icon: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None
    metadata_json: Optional[Dict[str, Any]] = None

class CMSSectionResponse(BaseModel):
    id: str
    section_key: str
    title: str
    subtitle: Optional[str] = None
    kicker: Optional[str] = None
    is_visible: bool
    display_order: int
    metadata_json: Dict[str, Any] = {}
    blocks: List[CMSContentBlockResponse] = []

    class Config:
        from_attributes = True

class CMSSectionUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    kicker: Optional[str] = None
    is_visible: Optional[bool] = None
    display_order: Optional[int] = None
    metadata_json: Optional[Dict[str, Any]] = None

class NavigationItemResponse(BaseModel):
    id: str
    label: str
    url: str
    order_index: int
    is_visible: bool
    is_button: bool
    target_blank: bool

    class Config:
        from_attributes = True

class NavigationItemUpdate(BaseModel):
    label: Optional[str] = None
    url: Optional[str] = None
    order_index: Optional[int] = None
    is_visible: Optional[bool] = None
    is_button: Optional[bool] = None
    target_blank: Optional[bool] = None

class SiteSettingResponse(BaseModel):
    id: str
    setting_key: str
    setting_value: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class AdminDashboardStats(BaseModel):
    total_users: int
    active_subscribers: int
    total_courses: int
    total_enrollments: int
    total_revenue_ron: float
    pending_workshop_leads: int
    pending_home_nursing_leads: int
    certificates_issued: int
