import re
import json
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.api.deps import get_current_admin
from app.models.user import User
from app.models.course import Category, Course
from app.schemas.settings import (
    SettingsBulkUpdate,
    CategoryAdminResponse,
    CategoryCreate,
    CategoryUpdate,
    TestEmailRequest,
    TestPaymentRequest,
)
from app.services.settings_service import (
    get_all_settings_dict,
    update_settings_bulk,
    get_setting_value_raw,
    send_test_smtp_email,
    test_stripe_configuration,
)

router = APIRouter()

# ----------------- GENERAL & CATEGORIZED SETTINGS -----------------

@router.get("/all")
async def get_all_settings(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Retrieve all application settings with secrets masked."""
    settings_data = await get_all_settings_dict(db, mask_secrets=True)
    return {
        "status": "success",
        "settings": settings_data,
    }

@router.put("/bulk")
async def save_settings_bulk(
    body: SettingsBulkUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Update settings in bulk with audit logging."""
    res = await update_settings_bulk(
        db=db,
        updates=body.settings,
        admin_user_id=admin.id,
        admin_email=admin.email,
    )
    return res

# ----------------- EMAIL & SMTP TEST -----------------

@router.post("/email/test")
async def test_email_endpoint(
    req: TestEmailRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Send a real test email using supplied or persisted SMTP configuration."""
    host = req.smtp_host or await get_setting_value_raw(db, "email_smtp_host", "smtp.gmail.com")
    port = req.smtp_port or int(await get_setting_value_raw(db, "email_smtp_port", "587"))
    enc = req.smtp_encryption or await get_setting_value_raw(db, "email_smtp_encryption", "tls")
    user = req.smtp_username or await get_setting_value_raw(db, "email_smtp_username", "")
    
    # Check password: if supplied or saved in database
    pwd = req.smtp_password
    if not pwd or pwd == "••••••••":
        pwd = await get_setting_value_raw(db, "email_smtp_password", "")

    from_name = req.smtp_from_name or await get_setting_value_raw(db, "email_smtp_from_name", "NursLab")
    from_email = req.smtp_from_email or await get_setting_value_raw(db, "email_smtp_from_email", user)

    result = send_test_smtp_email(
        to_email=req.to_email,
        smtp_host=host,
        smtp_port=port,
        smtp_encryption=enc,
        smtp_username=user if user else None,
        smtp_password=pwd if pwd else None,
        smtp_from_name=from_name,
        smtp_from_email=from_email,
    )

    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message", "Eroare conexiune SMTP"))

    return result

# ----------------- PAYMENT PROVIDER DIAGNOSTICS -----------------

@router.post("/payments/test")
async def test_payment_endpoint(
    req: TestPaymentRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Perform diagnostic validation on Stripe payment configuration."""
    mode = req.stripe_mode or await get_setting_value_raw(db, "payment_stripe_mode", "test")
    sec_key = req.stripe_secret_key
    if not sec_key or sec_key == "••••••••":
        sec_key = await get_setting_value_raw(db, "payment_stripe_secret_key", "")

    result = test_stripe_configuration(secret_key=sec_key, mode=mode)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message", "Eroare validare Stripe"))

    return result

# ----------------- COURSE CATEGORIES CRUD -----------------

@router.get("/categories", response_model=List[CategoryAdminResponse])
async def get_admin_categories(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Retrieve all categories with courses count and display order."""
    res = await db.execute(
        select(Category).order_by(Category.display_order, Category.name)
    )
    categories = res.scalars().all()

    # Calculate courses count for each category
    result = []
    for cat in categories:
        cnt_res = await db.execute(
            select(func.count(Course.id)).where(Course.category_id == cat.id)
        )
        cnt = cnt_res.scalar() or 0

        result.append(
            CategoryAdminResponse(
                id=cat.id,
                name=cat.name,
                slug=cat.slug,
                description=cat.description,
                icon=cat.icon,
                display_order=cat.display_order,
                is_active=cat.is_active,
                courses_count=cnt,
                created_at=cat.created_at,
                updated_at=cat.updated_at,
            )
        )

    return result

@router.post("/categories", response_model=CategoryAdminResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    cat_in: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Create a new course category with unique slug validation."""
    slug = cat_in.slug
    if not slug or not slug.strip():
        slug = re.sub(r'[^a-z0-9]+', '-', cat_in.name.lower()).strip('-')

    # Verify uniqueness of slug and name
    chk_slug = await db.execute(select(Category).where(Category.slug == slug))
    if chk_slug.scalar_one_or_none():
        raise HTTPException(status_code=400, detail=f"Slug-ul '{slug}' este deja utilizat de o altă categorie.")

    chk_name = await db.execute(select(Category).where(Category.name == cat_in.name))
    if chk_name.scalar_one_or_none():
        raise HTTPException(status_code=400, detail=f"Categoria cu numele '{cat_in.name}' există deja.")

    new_cat = Category(
        name=cat_in.name,
        slug=slug,
        description=cat_in.description,
        icon=cat_in.icon,
        display_order=cat_in.display_order or 0,
        is_active=cat_in.is_active if cat_in.is_active is not None else True,
    )
    db.add(new_cat)
    await db.commit()
    await db.refresh(new_cat)

    return CategoryAdminResponse(
        id=new_cat.id,
        name=new_cat.name,
        slug=new_cat.slug,
        description=new_cat.description,
        icon=new_cat.icon,
        display_order=new_cat.display_order,
        is_active=new_cat.is_active,
        courses_count=0,
        created_at=new_cat.created_at,
        updated_at=new_cat.updated_at,
    )

@router.put("/categories/{category_id}", response_model=CategoryAdminResponse)
async def update_category(
    category_id: str,
    cat_in: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Update existing course category safely."""
    res = await db.execute(select(Category).where(Category.id == category_id))
    cat = res.scalar_one_or_none()
    if not cat:
        raise HTTPException(status_code=404, detail="Categoria nu a fost găsită")

    update_data = cat_in.model_dump(exclude_unset=True)

    if "slug" in update_data and update_data["slug"] != cat.slug:
        chk = await db.execute(
            select(Category).where(Category.slug == update_data["slug"], Category.id != category_id)
        )
        if chk.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Slug-ul este deja utilizat de o altă categorie.")

    if "name" in update_data and update_data["name"] != cat.name:
        chk = await db.execute(
            select(Category).where(Category.name == update_data["name"], Category.id != category_id)
        )
        if chk.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Numele este deja utilizat de o altă categorie.")

    for field, val in update_data.items():
        setattr(cat, field, val)

    await db.commit()
    await db.refresh(cat)

    cnt_res = await db.execute(select(func.count(Course.id)).where(Course.category_id == cat.id))
    cnt = cnt_res.scalar() or 0

    return CategoryAdminResponse(
        id=cat.id,
        name=cat.name,
        slug=cat.slug,
        description=cat.description,
        icon=cat.icon,
        display_order=cat.display_order,
        is_active=cat.is_active,
        courses_count=cnt,
        created_at=cat.created_at,
        updated_at=cat.updated_at,
    )

@router.delete("/categories/{category_id}")
async def delete_category(
    category_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Safely delete category or prevent deletion if courses are assigned."""
    res = await db.execute(select(Category).where(Category.id == category_id))
    cat = res.scalar_one_or_none()
    if not cat:
        raise HTTPException(status_code=404, detail="Categoria nu a fost găsită")

    # Safety check: are there existing courses assigned to this category?
    cnt_res = await db.execute(select(func.count(Course.id)).where(Course.category_id == category_id))
    courses_count = cnt_res.scalar() or 0

    if courses_count > 0:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Nu se poate șterge categoria '{cat.name}' deoarece este asociată cu {courses_count} cursuri existente. "
                f"Reatribuiți aceste cursuri altei categorii sau dezactivați categoria în loc să o ștergeți."
            )
        )

    await db.delete(cat)
    await db.commit()
    return {"status": "deleted", "id": category_id, "name": cat.name}

# ----------------- REUSABLE CATALOGS -----------------

@router.get("/catalogs")
async def get_catalogs(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Retrieve reusable options: course levels, formats, specialties, lesson types."""
    levels_raw = await get_setting_value_raw(db, "catalogs_course_levels", '["beginner", "intermediate", "advanced"]')
    formats_raw = await get_setting_value_raw(db, "catalogs_course_formats", '["online", "in-person", "hybrid"]')
    specialties_raw = await get_setting_value_raw(
        db,
        "catalogs_instructor_specialties",
        '["ATI & Terapie Intensivă", "Urgențe Medicale (UPU)", "Chirurgie Generală", "Pediatrie", "Cardiologie Clinică", "Îngrijiri Paliative"]'
    )
    lesson_types_raw = await get_setting_value_raw(db, "catalogs_lesson_types", '["video", "article", "quiz", "workshop"]')

    return {
        "course_levels": json.loads(levels_raw),
        "course_formats": json.loads(formats_raw),
        "instructor_specialties": json.loads(specialties_raw),
        "lesson_types": json.loads(lesson_types_raw),
    }

@router.put("/catalogs/{catalog_key}")
async def update_catalog(
    catalog_key: str,
    items: List[str],
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Update items for a specific reusable catalog."""
    allowed_keys = {
        "course_levels": "catalogs_course_levels",
        "course_formats": "catalogs_course_formats",
        "instructor_specialties": "catalogs_instructor_specialties",
        "lesson_types": "catalogs_lesson_types",
    }
    if catalog_key not in allowed_keys:
        raise HTTPException(status_code=400, detail=f"Catalog necunoscut: {catalog_key}")

    db_key = allowed_keys[catalog_key]
    val_json = json.dumps(items, ensure_ascii=False)
    await update_settings_bulk(db, {db_key: val_json}, admin_user_id=admin.id, admin_email=admin.email)

    return {"status": "success", "catalog": catalog_key, "items": items}
