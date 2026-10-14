from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.workshop import WorkshopCity, WorkshopTopic, WorkshopInterestRegistration
from app.schemas.workshop import (
    WorkshopCityResponse, WorkshopTopicResponse,
    WorkshopInterestCreate, WorkshopInterestResponse,
    WorkshopInterestAdminCreate, WorkshopInterestAdminUpdate
)
from app.api.deps import get_current_admin

router = APIRouter()

@router.get("/cities", response_model=List[WorkshopCityResponse])
async def get_workshop_cities(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(WorkshopCity).where(WorkshopCity.is_active == True).order_by(WorkshopCity.display_order))
    return [WorkshopCityResponse.model_validate(c) for c in res.scalars().all()]

@router.get("/topics", response_model=List[WorkshopTopicResponse])
async def get_workshop_topics(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(WorkshopTopic).where(WorkshopTopic.is_active == True).order_by(WorkshopTopic.display_order))
    return [WorkshopTopicResponse.model_validate(t) for t in res.scalars().all()]

@router.post("/interest", response_model=WorkshopInterestResponse, status_code=status.HTTP_201_CREATED)
async def submit_workshop_interest(
    interest_in: WorkshopInterestCreate,
    db: AsyncSession = Depends(get_db)
):
    reg = WorkshopInterestRegistration(
        full_name=interest_in.full_name.strip(),
        email=interest_in.email.lower(),
        phone=interest_in.phone.strip(),
        city_name=interest_in.city_name.strip(),
        topic_title=interest_in.topic_title.strip(),
        notes=interest_in.notes,
        status="new"
    )
    db.add(reg)
    await db.commit()
    await db.refresh(reg)
    return WorkshopInterestResponse.model_validate(reg)

@router.get("/admin/registrations", response_model=List[WorkshopInterestResponse])
async def list_admin_workshop_registrations(
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_admin)
):
    res = await db.execute(
        select(WorkshopInterestRegistration).order_by(WorkshopInterestRegistration.created_at.desc())
    )
    return [WorkshopInterestResponse.model_validate(r) for r in res.scalars().all()]

@router.post("/admin/registrations", response_model=WorkshopInterestResponse, status_code=status.HTTP_201_CREATED)
async def create_admin_workshop_registration(
    payload: WorkshopInterestAdminCreate,
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_admin)
):
    reg = WorkshopInterestRegistration(
        full_name=payload.full_name.strip(),
        email=payload.email.lower(),
        phone=payload.phone.strip(),
        city_name=payload.city_name.strip(),
        topic_title=payload.topic_title.strip(),
        notes=payload.notes,
        status=payload.status or "new"
    )
    db.add(reg)
    await db.commit()
    await db.refresh(reg)
    return WorkshopInterestResponse.model_validate(reg)

@router.put("/admin/registrations/{reg_id}", response_model=WorkshopInterestResponse)
async def update_admin_workshop_registration(
    reg_id: str,
    payload: WorkshopInterestAdminUpdate,
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_admin)
):
    res = await db.execute(select(WorkshopInterestRegistration).where(WorkshopInterestRegistration.id == reg_id))
    reg = res.scalar_one_or_none()
    if not reg:
        raise HTTPException(status_code=404, detail="Înregistrare inexistentă.")
    
    if payload.full_name is not None:
        reg.full_name = payload.full_name.strip()
    if payload.email is not None:
        reg.email = payload.email.lower()
    if payload.phone is not None:
        reg.phone = payload.phone.strip()
    if payload.city_name is not None:
        reg.city_name = payload.city_name.strip()
    if payload.topic_title is not None:
        reg.topic_title = payload.topic_title.strip()
    if payload.notes is not None:
        reg.notes = payload.notes
    if payload.status is not None:
        reg.status = payload.status

    await db.commit()
    await db.refresh(reg)
    return WorkshopInterestResponse.model_validate(reg)

@router.put("/admin/registrations/{reg_id}/status")
async def update_registration_status(
    reg_id: str,
    status_str: str,
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_admin)
):
    res = await db.execute(select(WorkshopInterestRegistration).where(WorkshopInterestRegistration.id == reg_id))
    reg = res.scalar_one_or_none()
    if not reg:
        raise HTTPException(status_code=404, detail="Înregistrare inexistentă")
    reg.status = status_str
    await db.commit()
    return {"status": "updated", "new_status": status_str}

@router.delete("/admin/registrations/{reg_id}")
async def delete_admin_workshop_registration(
    reg_id: str,
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_admin)
):
    res = await db.execute(select(WorkshopInterestRegistration).where(WorkshopInterestRegistration.id == reg_id))
    reg = res.scalar_one_or_none()
    if not reg:
        raise HTTPException(status_code=404, detail="Înregistrare inexistentă.")
    
    await db.delete(reg)
    await db.commit()
    return {"status": "deleted", "id": reg_id}
