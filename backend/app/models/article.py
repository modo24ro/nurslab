from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid

class ArticleCategory(Base, TimestampMixin):
    __tablename__ = "article_categories"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(String(500), nullable=True)

    articles = relationship("Article", back_populates="category")

class Article(Base, TimestampMixin):
    __tablename__ = "articles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    excerpt = Column(String(500), nullable=False)
    content_markdown = Column(Text, nullable=False)
    cover_image = Column(String(500), nullable=True)
    author_name = Column(String(255), nullable=False)
    category_id = Column(String(36), ForeignKey("article_categories.id", ondelete="SET NULL"), nullable=True, index=True)
    is_published = Column(Boolean, default=True, nullable=False)
    reading_time_minutes = Column(Integer, default=5, nullable=False)
    published_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    category = relationship("ArticleCategory", back_populates="articles")
