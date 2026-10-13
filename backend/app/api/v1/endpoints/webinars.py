from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.webinar import Webinar, Speaker, WebinarRegistration
from app.models.user import User
from app.schemas.webinar import WebinarResponse, SpeakerResponse, WebinarRegisterRequest
from app.api.deps import get_optional_user, get_current_user

router = APIRouter()

@router.get("/speakers", response_model=List[SpeakerResponse])
async def list_speakers(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Speaker))
    return [SpeakerResponse.model_validate(s) for s in res.scalars().all()]

@router.get("/", response_model=List[WebinarResponse])
async def list_webinars(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_optional_user)
):
    query = (
        select(Webinar)
        .options(selectinload(Webinar.speaker))
        .where(Webinar.is_published == True)
        .order_by(Webinar.scheduled_at.desc())
    )
    res = await db.execute(query)
    webinars = res.scalars().all()

    registered_ids = set()
    if current_user:
        reg_res = await db.execute(
            select(WebinarRegistration.webinar_id).where(WebinarRegistration.user_id == current_user.id)
        )
        registered_ids = set(reg_res.scalars().all())

    output = []
    for w in webinars:
        output.append(
            WebinarResponse(
                id=w.id,
                title=w.title,
                slug=w.slug,
                description=w.description,
                webinar_type=w.webinar_type,
                badge=w.badge,
                scheduled_at=w.scheduled_at,
                duration_minutes=w.duration_minutes,
                cover_image=w.cover_image,
                speaker=SpeakerResponse.model_validate(w.speaker) if w.speaker else None,
                is_free=w.is_free,
                recording_url=w.recording_url,
                is_registered=w.id in registered_ids
            )
        )
    return output

@router.post("/register")
async def register_for_webinar(
    req: WebinarRegisterRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    w_res = await db.execute(select(Webinar).where(Webinar.id == req.webinar_id))
    webinar = w_res.scalar_one_or_none()
    if not webinar:
        raise HTTPException(status_code=404, detail="Webinar inexistent")

    reg_check = await db.execute(
        select(WebinarRegistration).where(
            WebinarRegistration.webinar_id == req.webinar_id,
            WebinarRegistration.user_id == current_user.id
        )
    )
    if reg_check.scalar_one_or_none():
        return {"status": "already_registered"}

    new_reg = WebinarRegistration(webinar_id=req.webinar_id, user_id=current_user.id)
    db.add(new_reg)
    await db.commit()
    return {"status": "registered"}
