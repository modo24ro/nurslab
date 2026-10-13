import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Numeric, Boolean, Text, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid

class BillingInterval(str, enum.Enum):
    MONTHLY = "monthly"
    ANNUAL = "annual"
    LIFETIME = "lifetime"

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"

class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELED = "canceled"
    EXPIRED = "expired"

class EntitlementType(str, enum.Enum):
    COURSE_ACCESS = "course_access"
    FULL_PLATFORM = "full_platform"
    WORKSHOP_ACCESS = "workshop_access"

class PricingPlan(Base, TimestampMixin):
    __tablename__ = "pricing_plans"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(String(500), nullable=True)
    billing_interval = Column(Enum(BillingInterval), default=BillingInterval.MONTHLY, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(10), default="RON", nullable=False)
    features_json = Column(JSON, default=list, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    badge = Column(String(50), nullable=True)

class Order(Base, TimestampMixin):
    __tablename__ = "orders"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(10), default="RON", nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    payment_method = Column(String(50), default="card", nullable=False)
    
    # Billing info (Romanian invoicing requirements)
    customer_name = Column(String(255), nullable=False)
    billing_email = Column(String(255), nullable=False)
    billing_phone = Column(String(50), nullable=True)
    billing_type = Column(String(20), default="individual", nullable=False) # individual | company
    company_name = Column(String(255), nullable=True)
    company_cui = Column(String(50), nullable=True)
    company_reg_com = Column(String(50), nullable=True)
    billing_address = Column(String(500), nullable=False)
    billing_city = Column(String(100), nullable=False)
    billing_country = Column(String(100), default="Romania", nullable=False)

    user = relationship("User")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    invoice = relationship("Invoice", back_populates="order", uselist=False)

class OrderItem(Base, TimestampMixin):
    __tablename__ = "order_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    order_id = Column(String(36), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    item_type = Column(String(50), nullable=False) # course, subscription, workshop
    item_id = Column(String(36), nullable=False)
    title = Column(String(255), nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)

    order = relationship("Order", back_populates="items")

class Subscription(Base, TimestampMixin):
    __tablename__ = "subscriptions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    plan_id = Column(String(36), ForeignKey("pricing_plans.id", ondelete="RESTRICT"), nullable=False, index=True)
    status = Column(Enum(SubscriptionStatus), default=SubscriptionStatus.ACTIVE, nullable=False)
    current_period_start = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    current_period_end = Column(DateTime(timezone=True), nullable=False)
    cancel_at_period_end = Column(Boolean, default=False, nullable=False)
    provider_subscription_id = Column(String(100), nullable=True)

    user = relationship("User")
    plan = relationship("PricingPlan")

class Entitlement(Base, TimestampMixin):
    __tablename__ = "entitlements"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    entitlement_type = Column(Enum(EntitlementType), nullable=False)
    reference_id = Column(String(36), nullable=True) # course_id or plan_id
    valid_from = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    valid_until = Column(DateTime(timezone=True), nullable=True) # null = permanent (e.g. lifetime course purchase)
    is_active = Column(Boolean, default=True, nullable=False)

    user = relationship("User")

class Invoice(Base, TimestampMixin):
    __tablename__ = "invoices"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    order_id = Column(String(36), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    invoice_series = Column(String(20), default="NLB", nullable=False)
    invoice_number = Column(Integer, nullable=False)
    issue_date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    vat_amount = Column(Numeric(10, 2), default=0.00, nullable=False) # 19% or exemption for accredited training
    currency = Column(String(10), default="RON", nullable=False)
    status = Column(String(20), default="issued", nullable=False)
    pdf_url = Column(String(500), nullable=True)

    order = relationship("Order", back_populates="invoice")
    user = relationship("User")
