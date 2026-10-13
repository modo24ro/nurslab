from sqlalchemy import Column, String, Integer, Boolean, Text, JSON
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid

class CMSSection(Base, TimestampMixin):
    __tablename__ = "cms_sections"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    section_key = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    subtitle = Column(Text, nullable=True)
    kicker = Column(String(255), nullable=True)
    is_visible = Column(Boolean, default=True, nullable=False)
    display_order = Column(Integer, default=0, nullable=False)
    metadata_json = Column(JSON, default=dict, nullable=False)

class CMSContentBlock(Base, TimestampMixin):
    __tablename__ = "cms_content_blocks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    section_key = Column(String(100), index=True, nullable=False)
    block_key = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    link_label = Column(String(100), nullable=True)
    link_url = Column(String(500), nullable=True)
    badge = Column(String(50), nullable=True)
    badge_variant = Column(String(50), default="mint", nullable=False) # mint, coral, sky
    icon = Column(String(50), nullable=True)
    display_order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    metadata_json = Column(JSON, default=dict, nullable=False)

class NavigationItem(Base, TimestampMixin):
    __tablename__ = "navigation_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    label = Column(String(100), nullable=False)
    url = Column(String(255), nullable=False)
    order_index = Column(Integer, default=0, nullable=False)
    is_visible = Column(Boolean, default=True, nullable=False)
    is_button = Column(Boolean, default=False, nullable=False)
    target_blank = Column(Boolean, default=False, nullable=False)

class SiteSetting(Base, TimestampMixin):
    __tablename__ = "site_settings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    setting_key = Column(String(100), unique=True, index=True, nullable=False)
    setting_value = Column(Text, nullable=False)
    description = Column(String(255), nullable=True)
    category = Column(String(50), default="general", nullable=True)
    is_secret = Column(Boolean, default=False, nullable=False)

class MediaAsset(Base, TimestampMixin):
    __tablename__ = "media_assets"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    file_name = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size_bytes = Column(Integer, default=0, nullable=False)
    alt_text = Column(String(255), nullable=True)

class AuditLog(Base, TimestampMixin):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), nullable=True)
    user_email = Column(String(255), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(String(100), nullable=True)
    details = Column(JSON, default=dict, nullable=False)
