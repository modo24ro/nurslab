from typing import Optional, List
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.models.payment import BillingInterval, OrderStatus, SubscriptionStatus

class PricingPlanResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    billing_interval: BillingInterval
    price: Decimal
    currency: str
    features_json: List[str]
    badge: Optional[str] = None

    class Config:
        from_attributes = True

class CheckoutItem(BaseModel):
    item_type: str # course, subscription, workshop
    item_id: str

class CheckoutRequest(BaseModel):
    items: List[CheckoutItem]
    customer_name: str
    billing_email: EmailStr
    billing_phone: Optional[str] = None
    billing_type: str = "individual" # individual | company
    company_name: Optional[str] = None
    company_cui: Optional[str] = None
    company_reg_com: Optional[str] = None
    billing_address: str
    billing_city: str
    billing_country: str = "Romania"

class OrderItemResponse(BaseModel):
    id: str
    item_type: str
    item_id: str
    title: str
    unit_price: Decimal

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: str
    order_number: str
    total_amount: Decimal
    currency: str
    status: OrderStatus
    payment_method: str
    customer_name: str
    billing_email: str
    billing_phone: Optional[str] = None
    billing_type: str = "individual"
    company_name: Optional[str] = None
    company_cui: Optional[str] = None
    company_reg_com: Optional[str] = None
    billing_address: Optional[str] = None
    billing_city: Optional[str] = None
    billing_country: str = "Romania"
    created_at: datetime
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True

class OrderCreateAdmin(BaseModel):
    customer_name: str
    billing_email: EmailStr
    billing_phone: Optional[str] = None
    billing_type: str = "individual"
    company_name: Optional[str] = None
    company_cui: Optional[str] = None
    company_reg_com: Optional[str] = None
    billing_address: str
    billing_city: str
    billing_country: str = "Romania"
    total_amount: Decimal
    currency: str = "RON"
    status: OrderStatus = OrderStatus.PAID
    payment_method: str = "card"
    item_title: Optional[str] = "Servicii Educaționale NursLab"
    item_type: Optional[str] = "course"

class OrderUpdateAdmin(BaseModel):
    customer_name: Optional[str] = None
    billing_email: Optional[EmailStr] = None
    billing_phone: Optional[str] = None
    billing_type: Optional[str] = None
    company_name: Optional[str] = None
    company_cui: Optional[str] = None
    company_reg_com: Optional[str] = None
    billing_address: Optional[str] = None
    billing_city: Optional[str] = None
    billing_country: Optional[str] = None
    total_amount: Optional[Decimal] = None
    currency: Optional[str] = None
    status: Optional[OrderStatus] = None
    payment_method: Optional[str] = None


class SubscriptionResponse(BaseModel):
    id: str
    plan_name: str
    billing_interval: str
    status: SubscriptionStatus
    price: Decimal
    currency: str
    current_period_start: datetime
    current_period_end: datetime
    cancel_at_period_end: bool

    class Config:
        from_attributes = True

class InvoiceResponse(BaseModel):
    id: str
    order_number: str
    invoice_series: str
    invoice_number: int
    full_invoice_number: str
    issue_date: datetime
    total_amount: Decimal
    vat_amount: Decimal
    currency: str
    status: str
    pdf_url: Optional[str] = None
    customer_name: str
    company_cui: Optional[str] = None

    class Config:
        from_attributes = True
