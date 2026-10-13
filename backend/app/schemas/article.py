from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class ArticleCategoryResponse(BaseModel):
    id: str
    name: str
    slug: str

    class Config:
        from_attributes = True

class ArticleResponse(BaseModel):
    id: str
    title: str
    slug: str
    excerpt: str
    cover_image: Optional[str] = None
    author_name: str
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    reading_time_minutes: int
    published_at: datetime

    class Config:
        from_attributes = True

class ArticleDetailResponse(BaseModel):
    id: str
    title: str
    slug: str
    excerpt: str
    content_markdown: str
    cover_image: Optional[str] = None
    author_name: str
    category_id: Optional[str] = None
    category: Optional[ArticleCategoryResponse] = None
    reading_time_minutes: int
    published_at: datetime

    class Config:
        from_attributes = True

class ArticleCreate(BaseModel):
    title: str
    slug: str
    excerpt: str
    content_markdown: str
    cover_image: Optional[str] = None
    author_name: str
    category_id: Optional[str] = None
    reading_time_minutes: int = 5
