from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.course import Course
from app.models.progress import CourseEnrollment
from app.models.payment import Order, Subscription, SubscriptionStatus, OrderStatus
from app.models.workshop import WorkshopInterestRegistration
from app.models.home_nursing import HomeNursingRequest
from app.models.certificate import Certificate
from app.schemas.cms import AdminDashboardStats
from app.schemas.auth import UserResponse
from app.schemas.payment import OrderResponse, OrderItemResponse
from app.api.deps import get_current_admin

router = APIRouter()

@router.get("/stats", response_model=AdminDashboardStats)
async def get_admin_dashboard_metrics(
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_admin)
):
    users_cnt = (await db.execute(select(func.count(User.id)))).scalar() or 0
    subs_cnt = (await db.execute(
        select(func.count(Subscription.id)).where(Subscription.status == SubscriptionStatus.ACTIVE)
    )).scalar() or 0
    courses_cnt = (await db.execute(select(func.count(Course.id)))).scalar() or 0
    enr_cnt = (await db.execute(select(func.count(CourseEnrollment.id)))).scalar() or 0
    
    rev_res = (await db.execute(
        select(func.sum(Order.total_amount)).where(Order.status == OrderStatus.PAID)
    )).scalar()
    total_rev = float(rev_res or 0.0)

    workshops_pending = (await db.execute(
        select(func.count(WorkshopInterestRegistration.id)).where(WorkshopInterestRegistration.status == "new")
    )).scalar() or 0

    nursing_pending = (await db.execute(
        select(func.count(HomeNursingRequest.id)).where(HomeNursingRequest.status == "pending")
    )).scalar() or 0

    certs_cnt = (await db.execute(select(func.count(Certificate.id)))).scalar() or 0

    return AdminDashboardStats(
        total_users=users_cnt,
        active_subscribers=subs_cnt,
        total_courses=courses_cnt,
        total_enrollments=enr_cnt,
        total_revenue_ron=total_rev,
        pending_workshop_leads=workshops_pending,
        pending_home_nursing_leads=nursing_pending,
        certificates_issued=certs_cnt
    )

@router.get("/users", response_model=List[UserResponse])
async def list_users(
    search: Optional[str] = None,
    role: Optional[UserRole] = None,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_admin)
):
    q = select(User)
    if role:
        q = q.where(User.role == role)
    if search:
        s = f"%{search}%"
        q = q.where(User.full_name.ilike(s) | User.email.ilike(s))
    q = q.order_by(User.created_at.desc()).limit(limit).offset(offset)
    res = await db.execute(q)
    return [UserResponse.model_validate(u) for u in res.scalars().all()]

@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    new_role: UserRole,
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_admin)
):
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Utilizator inexistent")
    user.role = new_role
    await db.commit()
    return {"status": "updated", "user_id": user_id, "new_role": new_role}

@router.get("/orders", response_model=List[OrderResponse])
async def list_all_orders(
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_admin)
):
    query = (
        select(Order)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
        .limit(100)
    )
    res = await db.execute(query)
    orders = res.scalars().all()
    output = []
    for o in orders:
        output.append(
            OrderResponse(
                id=o.id,
                order_number=o.order_number,
                total_amount=o.total_amount,
                currency=o.currency,
                status=o.status,
                payment_method=o.payment_method,
                customer_name=o.customer_name,
                billing_email=o.billing_email,
                created_at=o.created_at,
                items=[OrderItemResponse.model_validate(it) for it in o.items]
            )
        )
    return output
