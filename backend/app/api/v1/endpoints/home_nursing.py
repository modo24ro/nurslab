from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.home_nursing import HomeNursingService, HomeNursingRequest
from app.schemas.home_nursing import (
    HomeNursingServiceResponse, HomeNursingRequestCreate, HomeNursingRequestResponse,
    HomeNursingRequestAdminCreate, HomeNursingRequestAdminUpdate
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
        full_name=request_in.full_name.strip(),
        email=request_in.email.lower(),
        phone=request_in.phone.strip(),
        address=request_in.address.strip(),
        city=request_in.city.strip(),
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

@router.post("/admin/requests", response_model=HomeNursingRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_home_nursing_request_admin(
    payload: HomeNursingRequestAdminCreate,
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_admin)
):
    req = HomeNursingRequest(
        full_name=payload.full_name.strip(),
        email=payload.email.lower(),
        phone=payload.phone.strip(),
        address=payload.address.strip(),
        city=payload.city.strip(),
        service_type=payload.service_type.strip(),
        patient_condition=payload.patient_condition,
        urgency_level=payload.urgency_level,
        preferred_date=payload.preferred_date,
        status=payload.status or "pending",
        admin_notes=payload.admin_notes
    )
    db.add(req)
    await db.commit()
    await db.refresh(req)
    return HomeNursingRequestResponse.model_validate(req)

@router.put("/admin/requests/{request_id}", response_model=HomeNursingRequestResponse)
async def update_home_nursing_request_admin(
    request_id: str,
    payload: HomeNursingRequestAdminUpdate,
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_admin)
):
    res = await db.execute(select(HomeNursingRequest).where(HomeNursingRequest.id == request_id))
    req = res.scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="Cerere inexistentă.")
    
    if payload.full_name is not None:
        req.full_name = payload.full_name.strip()
    if payload.email is not None:
        req.email = payload.email.lower()
    if payload.phone is not None:
        req.phone = payload.phone.strip()
    if payload.address is not None:
        req.address = payload.address.strip()
    if payload.city is not None:
        req.city = payload.city.strip()
    if payload.service_type is not None:
        req.service_type = payload.service_type.strip()
    if payload.patient_condition is not None:
        req.patient_condition = payload.patient_condition
    if payload.urgency_level is not None:
        req.urgency_level = payload.urgency_level
    if payload.preferred_date is not None:
        req.preferred_date = payload.preferred_date
    if payload.status is not None:
        req.status = payload.status
    if payload.admin_notes is not None:
        req.admin_notes = payload.admin_notes

    await db.commit()
    await db.refresh(req)
    return HomeNursingRequestResponse.model_validate(req)

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

@router.delete("/admin/requests/{request_id}")
async def delete_home_nursing_request_admin(
    request_id: str,
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_admin)
):
    res = await db.execute(select(HomeNursingRequest).where(HomeNursingRequest.id == request_id))
    req = res.scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="Cerere inexistentă.")
    
    await db.delete(req)
    await db.commit()
    return {"status": "deleted", "id": request_id}
