import random
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.course import Course, Lesson
from app.models.webinar import Webinar
from app.models.progress import CourseEnrollment
from app.models.payment import Order, OrderItem, Subscription, SubscriptionStatus, OrderStatus
from app.models.workshop import WorkshopInterestRegistration
from app.models.home_nursing import HomeNursingRequest
from app.models.certificate import Certificate
from app.schemas.cms import AdminDashboardStats
from app.schemas.auth import UserResponse, UserCreateAdmin, UserUpdateAdmin
from app.schemas.payment import OrderResponse, OrderItemResponse, OrderCreateAdmin, OrderUpdateAdmin
from app.api.deps import get_current_admin

router = APIRouter()

@router.get("/stats", response_model=AdminDashboardStats)
async def get_admin_dashboard_metrics(
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_admin)
):
    users_cnt = (await db.execute(select(func.count(User.id)))).scalar() or 0
    students_cnt = (await db.execute(select(func.count(User.id)).where(User.role == UserRole.STUDENT))).scalar() or 0
    instructors_cnt = (await db.execute(select(func.count(User.id)).where(User.role == UserRole.INSTRUCTOR))).scalar() or 0
    admins_cnt = (await db.execute(select(func.count(User.id)).where(User.role.in_([UserRole.ADMIN, UserRole.SUPER_ADMIN])))).scalar() or 0

    subs_cnt = (await db.execute(
        select(func.count(Subscription.id)).where(Subscription.status == SubscriptionStatus.ACTIVE)
    )).scalar() or 0
    courses_cnt = (await db.execute(select(func.count(Course.id)))).scalar() or 0
    free_courses_cnt = (await db.execute(select(func.count(Course.id)).where(Course.is_free == True))).scalar() or 0
    paid_courses_cnt = (await db.execute(select(func.count(Course.id)).where(Course.is_free == False))).scalar() or 0
    lessons_cnt = (await db.execute(select(func.count(Lesson.id)))).scalar() or 0
    enr_cnt = (await db.execute(select(func.count(CourseEnrollment.id)))).scalar() or 0
    
    rev_res = (await db.execute(
        select(func.sum(Order.total_amount)).where(Order.status == OrderStatus.PAID)
    )).scalar()
    total_rev = float(rev_res or 0.0)

    paid_orders_cnt = (await db.execute(select(func.count(Order.id)).where(Order.status == OrderStatus.PAID))).scalar() or 0
    pending_orders_cnt = (await db.execute(select(func.count(Order.id)).where(Order.status == OrderStatus.PENDING))).scalar() or 0
    failed_orders_cnt = (await db.execute(select(func.count(Order.id)).where(Order.status.in_([OrderStatus.FAILED, OrderStatus.REFUNDED])))).scalar() or 0
    avg_order_val = round(total_rev / paid_orders_cnt, 2) if paid_orders_cnt > 0 else 0.0

    webinars_cnt = (await db.execute(select(func.count(Webinar.id)))).scalar() or 0
    upcoming_webinars_cnt = (await db.execute(select(func.count(Webinar.id)).where(Webinar.is_published == True))).scalar() or 0

    workshops_total = (await db.execute(select(func.count(WorkshopInterestRegistration.id)))).scalar() or 0
    workshops_pending = (await db.execute(
        select(func.count(WorkshopInterestRegistration.id)).where(WorkshopInterestRegistration.status == "new")
    )).scalar() or 0
    workshops_contacted = (await db.execute(
        select(func.count(WorkshopInterestRegistration.id)).where(WorkshopInterestRegistration.status == "contacted")
    )).scalar() or 0
    workshops_enrolled = (await db.execute(
        select(func.count(WorkshopInterestRegistration.id)).where(WorkshopInterestRegistration.status == "enrolled")
    )).scalar() or 0

    nursing_total = (await db.execute(select(func.count(HomeNursingRequest.id)))).scalar() or 0
    nursing_pending = (await db.execute(
        select(func.count(HomeNursingRequest.id)).where(HomeNursingRequest.status == "pending")
    )).scalar() or 0
    nursing_scheduled = (await db.execute(
        select(func.count(HomeNursingRequest.id)).where(HomeNursingRequest.status == "scheduled")
    )).scalar() or 0
    nursing_completed = (await db.execute(
        select(func.count(HomeNursingRequest.id)).where(HomeNursingRequest.status == "completed")
    )).scalar() or 0
    nursing_urgent = (await db.execute(
        select(func.count(HomeNursingRequest.id)).where(HomeNursingRequest.urgency_level == "urgent")
    )).scalar() or 0

    certs_cnt = (await db.execute(select(func.count(Certificate.id)))).scalar() or 0

    # Recent 5 Orders
    recent_orders_q = await db.execute(
        select(Order).order_by(Order.created_at.desc()).limit(5)
    )
    recent_orders = [
        {
            "id": o.id,
            "order_number": o.order_number,
            "customer_name": o.customer_name,
            "billing_email": o.billing_email,
            "total_amount": float(o.total_amount),
            "currency": o.currency,
            "status": o.status.value if hasattr(o.status, "value") else str(o.status),
            "created_at": o.created_at.isoformat() if o.created_at else None
        }
        for o in recent_orders_q.scalars().all()
    ]

    # Recent 5 Users
    recent_users_q = await db.execute(
        select(User).order_by(User.created_at.desc()).limit(5)
    )
    recent_users = [
        {
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "role": u.role.value if hasattr(u.role, "value") else str(u.role),
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat() if u.created_at else None
        }
        for u in recent_users_q.scalars().all()
    ]

    # Recent 5 Leads (combination of recent workshops & home nursing)
    recent_workshops_q = await db.execute(
        select(WorkshopInterestRegistration).order_by(WorkshopInterestRegistration.created_at.desc()).limit(3)
    )
    recent_nursing_q = await db.execute(
        select(HomeNursingRequest).order_by(HomeNursingRequest.created_at.desc()).limit(3)
    )
    recent_leads = []
    for w in recent_workshops_q.scalars().all():
        recent_leads.append({
            "id": w.id,
            "type": "workshop",
            "title": f"Workshop: {w.city_name} - {w.topic_title}",
            "full_name": w.full_name,
            "phone": w.phone,
            "status": w.status,
            "created_at": w.created_at.isoformat() if w.created_at else None
        })
    for n in recent_nursing_q.scalars().all():
        recent_leads.append({
            "id": n.id,
            "type": "home_nursing",
            "title": f"Îngrijire la Domiciliu: {n.city} ({n.service_type})",
            "full_name": n.full_name,
            "phone": n.phone,
            "status": n.status,
            "created_at": n.created_at.isoformat() if n.created_at else None
        })
    # Sort leads descending by created_at
    recent_leads.sort(key=lambda x: x.get("created_at") or "", reverse=True)

    return AdminDashboardStats(
        total_users=users_cnt,
        active_subscribers=subs_cnt,
        total_courses=courses_cnt,
        total_enrollments=enr_cnt,
        total_revenue_ron=total_rev,
        pending_workshop_leads=workshops_pending,
        pending_home_nursing_leads=nursing_pending,
        certificates_issued=certs_cnt,
        students_count=students_cnt,
        instructors_count=instructors_cnt,
        admins_count=admins_cnt,
        paid_orders_count=paid_orders_cnt,
        pending_orders_count=pending_orders_cnt,
        failed_orders_count=failed_orders_cnt,
        average_order_value_ron=avg_order_val,
        free_courses_count=free_courses_cnt,
        paid_courses_count=paid_courses_cnt,
        total_lessons_count=lessons_cnt,
        total_webinars=webinars_cnt,
        upcoming_webinars=upcoming_webinars_cnt,
        total_workshop_registrations=workshops_total,
        contacted_workshop_leads=workshops_contacted,
        enrolled_workshop_leads=workshops_enrolled,
        total_home_nursing_requests=nursing_total,
        scheduled_home_nursing=nursing_scheduled,
        completed_home_nursing=nursing_completed,
        urgent_home_nursing=nursing_urgent,
        recent_orders=recent_orders,
        recent_users=recent_users,
        recent_leads=recent_leads[:5]
    )

# ----------------- USERS CRUD -----------------

@router.get("/users", response_model=List[UserResponse])
async def list_users(
    search: Optional[str] = None,
    role: Optional[UserRole] = None,
    limit: int = Query(200, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_admin)
):
    q = select(User)
    if role:
        q = q.where(User.role == role)
    if search:
        s = f"%{search}%"
        q = q.where(User.full_name.ilike(s) | User.email.ilike(s) | User.phone.ilike(s))
    q = q.order_by(User.created_at.desc()).limit(limit).offset(offset)
    res = await db.execute(q)
    return [UserResponse.model_validate(u) for u in res.scalars().all()]

@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user_admin(
    payload: UserCreateAdmin,
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_admin)
):
    # Check duplicate email
    existing = await db.execute(select(User).where(User.email == payload.email.lower()))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Există deja un utilizator înregistrat cu acest email.")
    
    new_user = User(
        email=payload.email.lower(),
        hashed_password=get_password_hash(payload.password),
        full_name=payload.full_name.strip(),
        role=payload.role,
        is_active=payload.is_active,
        is_verified=payload.is_verified,
        phone=payload.phone,
        hospital_affiliation=payload.hospital_affiliation,
        nursing_specialty=payload.nursing_specialty,
        bio=payload.bio
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return UserResponse.model_validate(new_user)

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user_admin(
    user_id: str,
    payload: UserUpdateAdmin,
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_admin)
):
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Utilizator inexistent.")
    
    if payload.email and payload.email.lower() != user.email:
        # Check uniqueness
        dup = await db.execute(select(User).where(User.email == payload.email.lower(), User.id != user_id))
        if dup.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Adresa de email aparține deja altui cont.")
        user.email = payload.email.lower()
    
    if payload.full_name is not None:
        user.full_name = payload.full_name.strip()
    if payload.role is not None:
        user.role = payload.role
    if payload.is_active is not None:
        user.is_active = payload.is_active
    if payload.is_verified is not None:
        user.is_verified = payload.is_verified
    if payload.phone is not None:
        user.phone = payload.phone
    if payload.hospital_affiliation is not None:
        user.hospital_affiliation = payload.hospital_affiliation
    if payload.nursing_specialty is not None:
        user.nursing_specialty = payload.nursing_specialty
    if payload.bio is not None:
        user.bio = payload.bio
    if payload.password and payload.password.strip():
        user.hashed_password = get_password_hash(payload.password.strip())
        
    await db.commit()
    await db.refresh(user)
    return UserResponse.model_validate(user)

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

@router.delete("/users/{user_id}")
async def delete_user_admin(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_admin)
):
    if admin.id == user_id:
        raise HTTPException(status_code=400, detail="Nu vă puteți șterge propriul cont de administrator conectat.")
    
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Utilizator inexistent.")
    
    await db.delete(user)
    await db.commit()
    return {"status": "deleted", "id": user_id}

# ----------------- ORDERS CRUD -----------------

@router.get("/orders", response_model=List[OrderResponse])
async def list_all_orders(
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_admin)
):
    query = (
        select(Order)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
        .limit(200)
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
                billing_phone=o.billing_phone,
                billing_type=o.billing_type or "individual",
                company_name=o.company_name,
                company_cui=o.company_cui,
                company_reg_com=o.company_reg_com,
                billing_address=o.billing_address,
                billing_city=o.billing_city,
                billing_country=o.billing_country or "Romania",
                created_at=o.created_at,
                items=[OrderItemResponse.model_validate(it) for it in o.items]
            )
        )
    return output

@router.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order_admin(
    payload: OrderCreateAdmin,
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_admin)
):
    # Generate unique order number
    date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
    rnd_suffix = random.randint(1000, 9999)
    order_num = f"NLB-{date_str}-{rnd_suffix}"

    new_order = Order(
        order_number=order_num,
        total_amount=payload.total_amount,
        currency=payload.currency,
        status=payload.status,
        payment_method=payload.payment_method,
        customer_name=payload.customer_name.strip(),
        billing_email=payload.billing_email.lower(),
        billing_phone=payload.billing_phone,
        billing_type=payload.billing_type,
        company_name=payload.company_name,
        company_cui=payload.company_cui,
        company_reg_com=payload.company_reg_com,
        billing_address=payload.billing_address.strip(),
        billing_city=payload.billing_city.strip(),
        billing_country=payload.billing_country or "Romania"
    )
    db.add(new_order)
    await db.flush()

    # Add order item
    item = OrderItem(
        order_id=new_order.id,
        item_type=payload.item_type or "course",
        item_id=str(uuid.uuid4()),
        title=payload.item_title or "Servicii Educaționale NursLab",
        unit_price=payload.total_amount
    )
    db.add(item)
    await db.commit()
    await db.refresh(new_order)

    # Reload with items
    res = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == new_order.id)
    )
    full_order = res.scalar_one()

    return OrderResponse(
        id=full_order.id,
        order_number=full_order.order_number,
        total_amount=full_order.total_amount,
        currency=full_order.currency,
        status=full_order.status,
        payment_method=full_order.payment_method,
        customer_name=full_order.customer_name,
        billing_email=full_order.billing_email,
        billing_phone=full_order.billing_phone,
        billing_type=full_order.billing_type or "individual",
        company_name=full_order.company_name,
        company_cui=full_order.company_cui,
        company_reg_com=full_order.company_reg_com,
        billing_address=full_order.billing_address,
        billing_city=full_order.billing_city,
        billing_country=full_order.billing_country or "Romania",
        created_at=full_order.created_at,
        items=[OrderItemResponse.model_validate(it) for it in full_order.items]
    )

@router.put("/orders/{order_id}", response_model=OrderResponse)
async def update_order_admin(
    order_id: str,
    payload: OrderUpdateAdmin,
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_admin)
):
    res = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    )
    order = res.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Comandă inexistentă.")
    
    if payload.customer_name is not None:
        order.customer_name = payload.customer_name.strip()
    if payload.billing_email is not None:
        order.billing_email = payload.billing_email.lower()
    if payload.billing_phone is not None:
        order.billing_phone = payload.billing_phone
    if payload.billing_type is not None:
        order.billing_type = payload.billing_type
    if payload.company_name is not None:
        order.company_name = payload.company_name
    if payload.company_cui is not None:
        order.company_cui = payload.company_cui
    if payload.company_reg_com is not None:
        order.company_reg_com = payload.company_reg_com
    if payload.billing_address is not None:
        order.billing_address = payload.billing_address.strip()
    if payload.billing_city is not None:
        order.billing_city = payload.billing_city.strip()
    if payload.billing_country is not None:
        order.billing_country = payload.billing_country
    if payload.total_amount is not None:
        order.total_amount = payload.total_amount
    if payload.currency is not None:
        order.currency = payload.currency
    if payload.status is not None:
        order.status = payload.status
    if payload.payment_method is not None:
        order.payment_method = payload.payment_method

    await db.commit()
    await db.refresh(order)

    return OrderResponse(
        id=order.id,
        order_number=order.order_number,
        total_amount=order.total_amount,
        currency=order.currency,
        status=order.status,
        payment_method=order.payment_method,
        customer_name=order.customer_name,
        billing_email=order.billing_email,
        billing_phone=order.billing_phone,
        billing_type=order.billing_type or "individual",
        company_name=order.company_name,
        company_cui=order.company_cui,
        company_reg_com=order.company_reg_com,
        billing_address=order.billing_address,
        billing_city=order.billing_city,
        billing_country=order.billing_country or "Romania",
        created_at=order.created_at,
        items=[OrderItemResponse.model_validate(it) for it in order.items]
    )

@router.delete("/orders/{order_id}")
async def delete_order_admin(
    order_id: str,
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_admin)
):
    res = await db.execute(select(Order).where(Order.id == order_id))
    order = res.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Comandă inexistentă.")
    
    await db.delete(order)
    await db.commit()
    return {"status": "deleted", "id": order_id}
