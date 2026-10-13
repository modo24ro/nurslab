import re
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.orm.attributes import flag_modified
from app.core.database import get_db
from app.models.webinar import Webinar, Speaker, WebinarRegistration
from app.models.user import User
from app.schemas.webinar import (
    WebinarResponse, SpeakerResponse, SpeakerDetailResponse,
    SpeakerCreate, SpeakerUpdate,
    WebinarCreate, WebinarUpdate, WebinarRegisterRequest
)
from app.api.deps import get_optional_user, get_current_user, get_current_admin

router = APIRouter()

# ----------------- SPEAKERS / INVITAȚI ENDPOINTS -----------------

@router.get("/speakers", response_model=List[SpeakerResponse])
async def list_speakers(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Speaker).order_by(Speaker.full_name))
    return [SpeakerResponse.model_validate(s) for s in res.scalars().all()]

@router.get("/speakers/{speaker_id}", response_model=SpeakerDetailResponse)
async def get_speaker_detail(speaker_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(Speaker)
        .options(selectinload(Speaker.webinars))
        .where(Speaker.id == speaker_id)
    )
    speaker = res.scalar_one_or_none()
    if not speaker:
        raise HTTPException(status_code=404, detail="Invitatul nu a fost găsit")
    
    webinars = [
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
            is_free=w.is_free,
            recording_url=w.recording_url,
            is_registered=False,
            is_published=w.is_published
        )
        for w in speaker.webinars if w.is_published
    ]
    
    return SpeakerDetailResponse(
        id=speaker.id,
        full_name=speaker.full_name,
        title=speaker.title,
        hospital=speaker.hospital,
        bio=speaker.bio,
        photo_url=speaker.photo_url,
        webinars=webinars
    )

@router.post("/speakers", response_model=SpeakerResponse, status_code=status.HTTP_201_CREATED)
async def create_speaker(
    speaker_in: SpeakerCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    speaker = Speaker(
        full_name=speaker_in.full_name,
        title=speaker_in.title,
        hospital=speaker_in.hospital,
        bio=speaker_in.bio,
        photo_url=speaker_in.photo_url,
        metadata_json=speaker_in.metadata_json or {}
    )
    db.add(speaker)
    await db.commit()
    await db.refresh(speaker)
    return SpeakerResponse.model_validate(speaker)

@router.put("/speakers/{speaker_id}", response_model=SpeakerResponse)
async def update_speaker(
    speaker_id: str,
    speaker_in: SpeakerUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    res = await db.execute(select(Speaker).where(Speaker.id == speaker_id))
    speaker = res.scalar_one_or_none()
    if not speaker:
        raise HTTPException(status_code=404, detail="Invitatul nu a fost găsit")

    update_data = speaker_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(speaker, field, val)

    if "metadata_json" in update_data:
        flag_modified(speaker, "metadata_json")

    await db.commit()
    await db.refresh(speaker)
    return SpeakerResponse.model_validate(speaker)

@router.delete("/speakers/{speaker_id}")
async def delete_speaker(
    speaker_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    res = await db.execute(select(Speaker).where(Speaker.id == speaker_id))
    speaker = res.scalar_one_or_none()
    if not speaker:
        raise HTTPException(status_code=404, detail="Invitatul nu a fost găsit")

    await db.delete(speaker)
    await db.commit()
    return {"status": "deleted", "id": speaker_id}


# ----------------- WEBINARS ENDPOINTS -----------------

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
                is_registered=w.id in registered_ids,
                is_published=w.is_published,
                metadata_json=w.metadata_json or {}
            )
        )
    return output

@router.get("/admin/all", response_model=List[WebinarResponse])
async def list_all_webinars_admin(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    query = (
        select(Webinar)
        .options(selectinload(Webinar.speaker))
        .order_by(Webinar.scheduled_at.desc())
    )
    res = await db.execute(query)
    webinars = res.scalars().all()

    return [
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
            is_registered=False,
            is_published=w.is_published,
            metadata_json=w.metadata_json or {}
        )
        for w in webinars
    ]

@router.post("/", response_model=WebinarResponse, status_code=status.HTTP_201_CREATED)
async def create_webinar(
    webinar_in: WebinarCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    slug = webinar_in.slug
    if not slug:
        slug = re.sub(r'[^a-z0-9]+', '-', webinar_in.title.lower()).strip('-')

    webinar = Webinar(
        title=webinar_in.title,
        slug=slug,
        description=webinar_in.description,
        webinar_type=webinar_in.webinar_type,
        badge=webinar_in.badge,
        scheduled_at=webinar_in.scheduled_at,
        duration_minutes=webinar_in.duration_minutes,
        cover_image=webinar_in.cover_image,
        speaker_id=webinar_in.speaker_id,
        is_free=webinar_in.is_free,
        recording_url=webinar_in.recording_url,
        is_published=webinar_in.is_published,
        metadata_json=webinar_in.metadata_json or {}
    )
    db.add(webinar)
    await db.commit()
    await db.refresh(webinar)

    # Reload speaker
    res = await db.execute(select(Webinar).options(selectinload(Webinar.speaker)).where(Webinar.id == webinar.id))
    reloaded = res.scalar_one()

    return WebinarResponse(
        id=reloaded.id,
        title=reloaded.title,
        slug=reloaded.slug,
        description=reloaded.description,
        webinar_type=reloaded.webinar_type,
        badge=reloaded.badge,
        scheduled_at=reloaded.scheduled_at,
        duration_minutes=reloaded.duration_minutes,
        cover_image=reloaded.cover_image,
        speaker=SpeakerResponse.model_validate(reloaded.speaker) if reloaded.speaker else None,
        is_free=reloaded.is_free,
        recording_url=reloaded.recording_url,
        is_registered=False,
        is_published=reloaded.is_published,
        metadata_json=reloaded.metadata_json or {}
    )

@router.put("/{webinar_id}", response_model=WebinarResponse)
async def update_webinar(
    webinar_id: str,
    webinar_in: WebinarUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    res = await db.execute(select(Webinar).options(selectinload(Webinar.speaker)).where(Webinar.id == webinar_id))
    webinar = res.scalar_one_or_none()
    if not webinar:
        raise HTTPException(status_code=404, detail="Webinar inexistent")

    update_data = webinar_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(webinar, field, val)

    if "metadata_json" in update_data:
        flag_modified(webinar, "metadata_json")

    await db.commit()
    await db.refresh(webinar)

    res = await db.execute(select(Webinar).options(selectinload(Webinar.speaker)).where(Webinar.id == webinar.id))
    reloaded = res.scalar_one()

    return WebinarResponse(
        id=reloaded.id,
        title=reloaded.title,
        slug=reloaded.slug,
        description=reloaded.description,
        webinar_type=reloaded.webinar_type,
        badge=reloaded.badge,
        scheduled_at=reloaded.scheduled_at,
        duration_minutes=reloaded.duration_minutes,
        cover_image=reloaded.cover_image,
        speaker=SpeakerResponse.model_validate(reloaded.speaker) if reloaded.speaker else None,
        is_free=reloaded.is_free,
        recording_url=reloaded.recording_url,
        is_registered=False,
        is_published=reloaded.is_published,
        metadata_json=reloaded.metadata_json or {}
    )

@router.delete("/{webinar_id}")
async def delete_webinar(
    webinar_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    res = await db.execute(select(Webinar).where(Webinar.id == webinar_id))
    webinar = res.scalar_one_or_none()
    if not webinar:
        raise HTTPException(status_code=404, detail="Webinar inexistent")

    await db.delete(webinar)
    await db.commit()
    return {"status": "deleted", "id": webinar_id}

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
