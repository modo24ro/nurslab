"""Global, diacritic-insensitive search across public content.

Matching rules:
- The query is trimmed and split into words; EVERY word must appear in the
  searched fields (AND semantics), so "Situațiilor Critice în Gardă" finds the
  item containing that phrase regardless of word order inside the text.
- Diacritics and case are ignored on both sides via PostgreSQL `unaccent` +
  `lower` (ș/ş, ț/ţ, ă, â, î are all normalised).
- Results are ranked: exact phrase in title > all words in title > match in
  description only.
Only published / public content is returned.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import func, and_, select, case, literal, String
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.course import Course
from app.models.webinar import Webinar, Speaker
from app.models.article import Article

router = APIRouter()


class SearchHit(BaseModel):
    type: str  # course | webinar | speaker | article
    id: str
    title: str
    subtitle: Optional[str] = None
    url: str
    image: Optional[str] = None
    badge: Optional[str] = None


class SearchResponse(BaseModel):
    query: str
    total: int
    courses: List[SearchHit] = []
    webinars: List[SearchHit] = []
    speakers: List[SearchHit] = []
    articles: List[SearchHit] = []


def _norm(col):
    return func.lower(func.unaccent(func.coalesce(col, "")))


def _norm_text(value: str):
    return func.lower(func.unaccent(literal(value, type_=String)))


def _contains(hay, needle):
    return hay.like(func.concat("%", needle, "%"))


def _build(tokens: List[str], phrase: str, title_col, *other_cols):
    """Returns (where_clause, rank_expression) for one model."""
    title_n = _norm(title_col)
    haystack = func.concat_ws(" ", title_n, *[_norm(c) for c in other_cols])

    norm_tok = [_norm_text(t) for t in tokens]
    where = and_(*[_contains(haystack, t) for t in norm_tok])

    norm_phrase = _norm_text(phrase)
    rank = case(
        (title_n == norm_phrase, 0),
        (_contains(title_n, norm_phrase), 1),
        (and_(*[_contains(title_n, t) for t in norm_tok]), 2),
        else_=3,
    )
    return where, rank


@router.get("/", response_model=SearchResponse)
async def global_search(
    q: str = Query(..., min_length=1, max_length=200),
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    phrase = " ".join(q.split())  # trim + collapse whitespace
    tokens = [t for t in phrase.split(" ") if len(t) >= 2] or [phrase]

    # Courses
    w, r = _build(tokens, phrase, Course.title, Course.short_description, Course.full_description)
    rows = (await db.execute(
        select(Course).where(Course.is_published == True, w).order_by(r, Course.title).limit(limit)
    )).scalars().all()
    courses = [SearchHit(type="course", id=c.id, title=c.title, subtitle=c.short_description,
                         url=f"/courses/{c.slug}", image=c.cover_image,
                         badge="GRATUIT" if c.is_free else "CU PLATĂ") for c in rows]

    # Webinars
    w, r = _build(tokens, phrase, Webinar.title, Webinar.description)
    rows = (await db.execute(
        select(Webinar).where(Webinar.is_published == True, w).order_by(r, Webinar.scheduled_at.desc()).limit(limit)
    )).scalars().all()
    webinars = [SearchHit(type="webinar", id=x.id, title=x.title, subtitle=x.description,
                          url=f"/webinars#webinar-{x.id}", image=x.cover_image, badge=x.badge) for x in rows]

    # Speakers / guests
    w, r = _build(tokens, phrase, Speaker.full_name, Speaker.title, Speaker.hospital, Speaker.bio)
    rows = (await db.execute(select(Speaker).where(w).order_by(r, Speaker.full_name).limit(limit))).scalars().all()
    speakers = [SearchHit(type="speaker", id=s.id, title=s.full_name,
                          subtitle=" • ".join(filter(None, [s.title, s.hospital])),
                          url=f"/guests/{s.id}", image=s.photo_url, badge="INVITAT") for s in rows]

    # Articles
    w, r = _build(tokens, phrase, Article.title, Article.excerpt)
    q_art = select(Article).where(w)
    if hasattr(Article, "is_published"):
        q_art = q_art.where(Article.is_published == True)
    rows = (await db.execute(q_art.order_by(r).limit(limit))).scalars().all()
    articles = [SearchHit(type="article", id=a.id, title=a.title, subtitle=a.excerpt,
                          url=f"/articles/{a.slug}", image=getattr(a, "cover_image", None),
                          badge="ARTICOL") for a in rows]

    total = len(courses) + len(webinars) + len(speakers) + len(articles)
    return SearchResponse(query=phrase, total=total, courses=courses, webinars=webinars,
                          speakers=speakers, articles=articles)
