import uuid
from decimal import Decimal
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.config import settings
from app.models.payment import (
    PricingPlan, Order, OrderItem, Subscription, Entitlement, Invoice,
    OrderStatus, SubscriptionStatus, EntitlementType
)
from app.models.course import Course
from app.models.progress import CourseEnrollment
from app.models.user import User
from app.schemas.payment import (
    PricingPlanResponse, CheckoutRequest, OrderResponse, OrderItemResponse,
    SubscriptionResponse, InvoiceResponse
)
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/plans", response_model=List[PricingPlanResponse])
async def get_pricing_plans(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(PricingPlan).where(PricingPlan.is_active == True))
    plans = res.scalars().all()
    return [PricingPlanResponse.model_validate(p) for p in plans]

@router.post("/checkout", response_model=OrderResponse)
async def create_checkout(
    checkout_in: CheckoutRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not checkout_in.items:
        raise HTTPException(status_code=400, detail="Coșul de cumpărături este gol")

    total_amount = Decimal("0.00")
    order_items_to_create = []

    for item in checkout_in.items:
        if item.item_type == "course":
            c_res = await db.execute(select(Course).where(Course.id == item.item_id))
            course = c_res.scalar_one_or_none()
            if not course:
                raise HTTPException(status_code=404, detail=f"Cursul cu ID {item.item_id} nu există")
            total_amount += course.price
            order_items_to_create.append({
                "item_type": "course",
                "item_id": course.id,
                "title": f"Curs: {course.title}",
                "unit_price": course.price
            })
        elif item.item_type == "subscription":
            p_res = await db.execute(select(PricingPlan).where(PricingPlan.id == item.item_id))
            plan = p_res.scalar_one_or_none()
            if not plan:
                raise HTTPException(status_code=404, detail=f"Planul de abonament cu ID {item.item_id} nu există")
            total_amount += plan.price
            order_items_to_create.append({
                "item_type": "subscription",
                "item_id": plan.id,
                "title": f"Abonament: {plan.name}",
                "unit_price": plan.price
            })

    order_num = f"NLB-ORD-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    new_order = Order(
        user_id=current_user.id,
        order_number=order_num,
        total_amount=total_amount,
        currency="RON",
        status=OrderStatus.PAID, # In sandbox checkout completes directly
        payment_method="card",
        customer_name=checkout_in.customer_name,
        billing_email=checkout_in.billing_email,
        billing_phone=checkout_in.billing_phone,
        billing_type=checkout_in.billing_type,
        company_name=checkout_in.company_name,
        company_cui=checkout_in.company_cui,
        company_reg_com=checkout_in.company_reg_com,
        billing_address=checkout_in.billing_address,
        billing_city=checkout_in.billing_city,
        billing_country=checkout_in.billing_country,
    )
    db.add(new_order)
    await db.flush()

    for item_data in order_items_to_create:
        o_item = OrderItem(
            order_id=new_order.id,
            item_type=item_data["item_type"],
            item_id=item_data["item_id"],
            title=item_data["title"],
            unit_price=item_data["unit_price"]
        )
        db.add(o_item)

        # Grant entitlements & auto-enroll
        if item_data["item_type"] == "course":
            ent = Entitlement(
                user_id=current_user.id,
                entitlement_type=EntitlementType.COURSE_ACCESS,
                reference_id=item_data["item_id"],
                is_active=True
            )
            db.add(ent)
            # Create enrollment if not already
            enr_check = await db.execute(
                select(CourseEnrollment).where(
                    CourseEnrollment.user_id == current_user.id,
                    CourseEnrollment.course_id == item_data["item_id"]
                )
            )
            if not enr_check.scalar_one_or_none():
                db.add(CourseEnrollment(user_id=current_user.id, course_id=item_data["item_id"]))

        elif item_data["item_type"] == "subscription":
            # 30 days or 365 days
            sub = Subscription(
                user_id=current_user.id,
                plan_id=item_data["item_id"],
                status=SubscriptionStatus.ACTIVE,
                current_period_start=datetime.now(timezone.utc),
                current_period_end=datetime.now(timezone.utc) + timedelta(days=30),
            )
            db.add(sub)
            ent = Entitlement(
                user_id=current_user.id,
                entitlement_type=EntitlementType.FULL_PLATFORM,
                reference_id=item_data["item_id"],
                valid_until=datetime.now(timezone.utc) + timedelta(days=30),
                is_active=True
            )
            db.add(ent)

    # Generate sequential invoice
    last_inv_res = await db.execute(
        select(func.max(Invoice.invoice_number)).where(Invoice.invoice_series == settings.INVOICE_SERIES)
    )
    max_num = last_inv_res.scalar() or (settings.INVOICE_START_NUMBER - 1)
    next_num = max_num + 1

    invoice = Invoice(
        order_id=new_order.id,
        user_id=current_user.id,
        invoice_series=settings.INVOICE_SERIES,
        invoice_number=next_num,
        total_amount=total_amount,
        vat_amount=Decimal(round(float(total_amount) * 0.19, 2)), # 19% Romanian VAT
        currency="RON",
        status="issued"
    )
    db.add(invoice)

    await db.commit()
    await db.refresh(new_order)

    # Load items
    items_res = await db.execute(select(OrderItem).where(OrderItem.order_id == new_order.id))
    order_items = items_res.scalars().all()

    return OrderResponse(
        id=new_order.id,
        order_number=new_order.order_number,
        total_amount=new_order.total_amount,
        currency=new_order.currency,
        status=new_order.status,
        payment_method=new_order.payment_method,
        customer_name=new_order.customer_name,
        billing_email=new_order.billing_email,
        created_at=new_order.created_at,
        items=[OrderItemResponse.model_validate(it) for it in order_items]
    )

@router.get("/invoices/my", response_model=List[InvoiceResponse])
async def get_my_invoices(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = (
        select(Invoice)
        .options(selectinload(Invoice.order))
        .where(Invoice.user_id == current_user.id)
        .order_by(Invoice.issue_date.desc())
    )
    res = await db.execute(query)
    invoices = res.scalars().all()

    output = []
    for inv in invoices:
        output.append(
            InvoiceResponse(
                id=inv.id,
                order_number=inv.order.order_number if inv.order else "",
                invoice_series=inv.invoice_series,
                invoice_number=inv.invoice_number,
                full_invoice_number=f"{inv.invoice_series}-{inv.invoice_number:05d}",
                issue_date=inv.issue_date,
                total_amount=inv.total_amount,
                vat_amount=inv.vat_amount,
                currency=inv.currency,
                status=inv.status,
                pdf_url=f"/api/v1/invoices/{inv.id}/pdf",
                customer_name=inv.order.customer_name if inv.order else "",
                company_cui=inv.order.company_cui if inv.order else None
            )
        )
    return output

@router.get("/my-orders", response_model=List[OrderResponse])
async def get_my_orders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = (
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
    )
    res = await db.execute(query)
    orders = res.scalars().all()
    return [
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
        for o in orders
    ]

@router.get("/my-subscription", response_model=Optional[SubscriptionResponse])
async def get_my_subscription(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = (
        select(Subscription)
        .options(selectinload(Subscription.plan))
        .where(
            Subscription.user_id == current_user.id,
            Subscription.status == SubscriptionStatus.ACTIVE
        )
        .order_by(Subscription.current_period_end.desc())
    )
    res = await db.execute(query)
    sub = res.scalar_one_or_none()
    if not sub:
        return None
    return SubscriptionResponse(
        id=sub.id,
        plan_name=sub.plan.name if sub.plan else "Abonament",
        billing_interval=sub.plan.billing_interval if sub.plan else "month",
        status=sub.status,
        price=sub.plan.price if sub.plan else Decimal("0.00"),
        currency=sub.plan.currency if sub.plan else "RON",
        current_period_start=sub.current_period_start,
        current_period_end=sub.current_period_end,
        cancel_at_period_end=sub.cancel_at_period_end
    )

