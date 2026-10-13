from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.home_nursing import HomeNursingService, HomeNursingRequest
from app.schemas.home_nursing import (
    HomeNursingServiceResponse, HomeNursingRequestCreate, HomeNursingRequestResponse
)
from app.api.deps import get_current_admin

router = APIRouter()

@router.get("/services", response_model=List[HomeNursingServiceResponse])
async def get_home_nursing_services(db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(HomeNursingService).where(HomeNursingService.is_active == True).order_by(HomeNursingService.display_order)
    )
    return [HomeNursingServiceResponse.model_validate(s) for s in res.scalars().all()]

@router.post("/request", response_model=HomeNursingRequestResponse, status_code=status.HTTP_201_CREATED)
async def submit_home_nursing_request(
    request_in: HomeNursingRequestCreate,
    db: AsyncSession = Depends(get_db)
):
    req = HomeNursingRequest(
        full_name=request_in.full_name,
        email=request_in.email.lower(),
        phone=request_in.phone,
        address=request_in.address,
        city=request_in.city,
        service_type=request_in.service_type,
        patient_condition=request_in.patient_condition,
        urgency_level=request_in.urgency_level,
        preferred_date=request_in.preferred_date,
        status="pending"
    )
    db.add(req)
    await db.commit()
    await db.refresh(req)
    return HomeNursingRequestResponse.model_validate(req)

@router.get("/admin/requests", response_model=List[HomeNursingRequestResponse])
async def list_home_nursing_requests(
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_admin)
):
    res = await db.execute(
        select(HomeNursingRequest).order_by(HomeNursingRequest.created_at.desc())
    )
    return [HomeNursingRequestResponse.model_validate(r) for r in res.scalars().all()]

@router.put("/admin/requests/{request_id}/status")
async def update_home_nursing_status(
    request_id: str,
    status_str: str,
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_admin)
):
    res = await db.execute(select(HomeNursingRequest).where(HomeNursingRequest.id == request_id))
    req = res.scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="Cerere inexistentă")
    req.status = status_str
    await db.commit()
    return {"status": "updated", "new_status": status_str}
