from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.workshop import WorkshopCity, WorkshopTopic, WorkshopInterestRegistration
from app.schemas.workshop import (
    WorkshopCityResponse, WorkshopTopicResponse,
    WorkshopInterestCreate, WorkshopInterestResponse
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
        full_name=interest_in.full_name,
        email=interest_in.email.lower(),
        phone=interest_in.phone,
        city_name=interest_in.city_name,
        topic_title=interest_in.topic_title,
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
