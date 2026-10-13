from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.article import Article, ArticleCategory
from app.schemas.article import (
    ArticleResponse, ArticleDetailResponse, ArticleCategoryResponse, ArticleCreate
)
from app.api.deps import get_current_admin

router = APIRouter()

@router.get("/categories", response_model=List[ArticleCategoryResponse])
async def get_article_categories(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(ArticleCategory))
    return [ArticleCategoryResponse.model_validate(c) for c in res.scalars().all()]

@router.get("/", response_model=List[ArticleResponse])
async def list_articles(
    category_slug: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(Article)
        .options(selectinload(Article.category))
        .where(Article.is_published == True)
    )
    if category_slug:
        query = query.join(Article.category).where(ArticleCategory.slug == category_slug)

    query = query.order_by(Article.published_at.desc())
    res = await db.execute(query)
    articles = res.scalars().all()

    output = []
    for a in articles:
        output.append(
            ArticleResponse(
                id=a.id,
                title=a.title,
                slug=a.slug,
                excerpt=a.excerpt,
                cover_image=a.cover_image,
                author_name=a.author_name,
                category_id=a.category_id,
                category_name=a.category.name if a.category else None,
                reading_time_minutes=a.reading_time_minutes,
                published_at=a.published_at
            )
        )
    return output

@router.get("/{slug}", response_model=ArticleDetailResponse)
async def get_article_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    query = (
        select(Article)
        .options(selectinload(Article.category))
        .where(Article.slug == slug, Article.is_published == True)
    )
    res = await db.execute(query)
    article = res.scalar_one_or_none()
    if not article:
        raise HTTPException(status_code=404, detail="Articolul nu a fost găsit")

    return ArticleDetailResponse(
        id=article.id,
        title=article.title,
        slug=article.slug,
        excerpt=article.excerpt,
        content_markdown=article.content_markdown,
        cover_image=article.cover_image,
        author_name=article.author_name,
        category_id=article.category_id,
        category=ArticleCategoryResponse.model_validate(article.category) if article.category else None,
        reading_time_minutes=article.reading_time_minutes,
        published_at=article.published_at
    )
