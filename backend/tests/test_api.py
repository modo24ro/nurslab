import uuid
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "NursLab" in data["app"]

@pytest.mark.asyncio
async def test_public_cms_data(client: AsyncClient):
    response = await client.get("/api/v1/cms/public")
    assert response.status_code == 200
    data = response.json()
    assert "sections" in data
    assert "navigation" in data

@pytest.mark.asyncio
async def test_user_registration_and_login(client: AsyncClient):
    unique_email = f"nurse_{uuid.uuid4().hex[:8]}@nurslab.ro"
    reg_payload = {
        "email": unique_email,
        "password": "Password123!",
        "full_name": "Asistent Test",
        "hospital_affiliation": "Spitalul Clinic de Urgență",
        "nursing_specialty": "ATI"
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == unique_email

    # Login
    login_res = await client.post("/api/v1/auth/login", json={
        "email": unique_email,
        "password": "Password123!"
    })
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

@pytest.mark.asyncio
async def test_course_catalog_and_categories(client: AsyncClient):
    # Fetch categories
    cat_res = await client.get("/api/v1/courses/categories")
    assert cat_res.status_code == 200
    categories = cat_res.json()
    assert len(categories) > 0

    # Fetch courses
    course_res = await client.get("/api/v1/courses/")
    assert course_res.status_code == 200
    courses = course_res.json()
    assert len(courses) > 0

    # Verify at least one free and one paid course exist
    has_free = any(c["is_free"] for c in courses)
    has_paid = any(not c["is_free"] for c in courses)
    assert has_free is True
    assert has_paid is True

@pytest.mark.asyncio
async def test_course_enrollment_and_lesson_access(client: AsyncClient):
    # Register test user
    email = f"student_{uuid.uuid4().hex[:8]}@spital.ro"
    reg_res = await client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "Password123!",
        "full_name": "Maria Popescu"
    })
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Find free course
    courses_res = await client.get("/api/v1/courses/?is_free=true")
    courses = courses_res.json()
    assert len(courses) > 0
    free_course = courses[0]

    # Enroll in free course
    enroll_res = await client.post(f"/api/v1/courses/{free_course['id']}/enroll", headers=headers)
    assert enroll_res.status_code == 200
    enroll_data = enroll_res.json()
    assert enroll_data["status"] == "enrolled"

    # Check course detail
    detail_res = await client.get(f"/api/v1/courses/{free_course['slug']}", headers=headers)
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["is_enrolled"] is True
    assert len(detail["sections"]) > 0

    # Get first lesson ID
    first_lesson_id = detail["sections"][0]["lessons"][0]["id"]
    lesson_res = await client.get(f"/api/v1/lessons/{first_lesson_id}", headers=headers)
    assert lesson_res.status_code == 200
    lesson_data = lesson_res.json()
    assert lesson_data["id"] == first_lesson_id
    assert "video_url" in lesson_data

@pytest.mark.asyncio
async def test_protected_lesson_forbidden_without_entitlement(client: AsyncClient):
    # Register test user
    email = f"student_{uuid.uuid4().hex[:8]}@spital.ro"
    reg_res = await client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "Password123!",
        "full_name": "Ion Vasile"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Find a paid course
    courses_res = await client.get("/api/v1/courses/?is_free=false")
    paid_courses = courses_res.json()
    assert len(paid_courses) > 0
    paid_course = paid_courses[0]

    # Fetch course details to find non-preview lesson
    detail_res = await client.get(f"/api/v1/courses/{paid_course['slug']}")
    detail = detail_res.json()

    # Find a non-preview lesson
    non_preview_lesson = None
    for section in detail["sections"]:
        for lesson in section["lessons"]:
            if not lesson.get("is_preview", False):
                non_preview_lesson = lesson
                break
        if non_preview_lesson:
            break

    if non_preview_lesson:
        lesson_res = await client.get(f"/api/v1/lessons/{non_preview_lesson['id']}", headers=headers)
        # Should be forbidden 403 because user hasn't purchased course or subscription
        assert lesson_res.status_code == 403

@pytest.mark.asyncio
async def test_pricing_plans_and_checkout_flow(client: AsyncClient):
    # Register test user
    email = f"buyer_{uuid.uuid4().hex[:8]}@spital.ro"
    reg_res = await client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "Password123!",
        "full_name": "Elena Ionescu"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get pricing plans
    plans_res = await client.get("/api/v1/payments/plans")
    assert plans_res.status_code == 200
    plans = plans_res.json()
    assert len(plans) > 0
    monthly_plan = plans[0]

    # Perform checkout for subscription with Romanian invoicing fields
    checkout_payload = {
        "items": [
            {
                "item_type": "subscription",
                "item_id": monthly_plan["id"]
            }
        ],
        "customer_name": "Elena Ionescu",
        "billing_email": email,
        "billing_phone": "0744111222",
        "billing_type": "company",
        "company_name": "Spitalul Clinic SRL",
        "company_cui": "RO12345678",
        "company_reg_com": "J40/1234/2020",
        "billing_address": "Calea Floreasca Nr. 8",
        "billing_city": "București",
        "billing_country": "România"
    }

    checkout_res = await client.post("/api/v1/payments/checkout", json=checkout_payload, headers=headers)
    assert checkout_res.status_code == 200
    order_data = checkout_res.json()
    assert order_data["status"] == "paid"
    assert order_data["order_number"].startswith("NLB-ORD-")

    # Verify user orders endpoint
    my_orders_res = await client.get("/api/v1/payments/my-orders", headers=headers)
    assert my_orders_res.status_code == 200
    my_orders = my_orders_res.json()
    assert len(my_orders) >= 1

    # Verify user subscription is active
    sub_res = await client.get("/api/v1/payments/my-subscription", headers=headers)
    assert sub_res.status_code == 200
    sub_data = sub_res.json()
    assert sub_data is not None
    assert sub_data["status"] == "active"

    # Verify Romanian invoice generation with NLB series
    invoices_res = await client.get("/api/v1/payments/invoices/my", headers=headers)
    assert invoices_res.status_code == 200
    invoices = invoices_res.json()
    assert len(invoices) >= 1
    assert invoices[0]["invoice_series"] == "NLB"
    assert invoices[0]["full_invoice_number"].startswith("NLB-")
    assert invoices[0]["company_cui"] == "RO12345678"

@pytest.mark.asyncio
async def test_workshop_interest_submission(client: AsyncClient):
    payload = {
        "full_name": "Andrei Popa",
        "email": f"andrei_{uuid.uuid4().hex[:6]}@spital.ro",
        "phone": "0722111222",
        "city_name": "Cluj-Napoca",
        "topic_title": "Suport Vital de Bază (BLS)"
    }
    res = await client.post("/api/v1/workshops/interest", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["city_name"] == "Cluj-Napoca"
    assert data["status"] == "new"

@pytest.mark.asyncio
async def test_home_nursing_request_submission(client: AsyncClient):
    payload = {
        "full_name": "Familia Georgescu",
        "email": f"georgescu_{uuid.uuid4().hex[:6]}@exemplu.ro",
        "phone": "0733444555",
        "address": "Str. Florilor Nr. 5",
        "city": "București",
        "service_type": "Toaletă și pansament escare",
        "urgency_level": "normal"
    }
    res = await client.post("/api/v1/home-nursing/request", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["city"] == "București"
    assert data["status"] == "pending"

@pytest.mark.asyncio
async def test_certificate_verification_endpoint(client: AsyncClient):
    # Non existent code check
    res = await client.get("/api/v1/certificates/verify/NLB-INVALID-CODE")
    assert res.status_code == 200
    data = res.json()
    assert data["is_valid"] is False

@pytest.mark.asyncio
async def test_cms_section_and_block_update_with_image_framing(client: AsyncClient):
    # 1. Login as Admin
    admin_login = await client.post("/api/v1/auth/login", json={
        "email": "admin@nurslab.ro",
        "password": "Admin123!"
    })
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Get sections
    sec_res = await client.get("/api/v1/cms/sections", headers=headers)
    assert sec_res.status_code == 200
    sections = sec_res.json()
    assert len(sections) > 0

    journey_sec = next(s for s in sections if s["section_key"] == "learning_journey")
    assert len(journey_sec["blocks"]) > 0
    first_block = journey_sec["blocks"][0]

    # 3. Update block with relative image URL and positioning metadata
    new_image_url = "/images/journey_theory.jpg"
    update_block_res = await client.put(
        f"/api/v1/cms/blocks/{first_block['id']}",
        json={
            "title": "1. Înțelegi teoria (Test Actualizat)",
            "image_url": new_image_url,
            "metadata_json": {
                "image_position_x": 50,
                "image_position_y": 15,
                "zoom": 1.25,
                "image_position": "50% 15%",
                "object_fit": "cover"
            }
        },
        headers=headers
    )
    assert update_block_res.status_code == 200
    updated_block = update_block_res.json()
    assert updated_block["title"] == "1. Înțelegi teoria (Test Actualizat)"
    assert updated_block["image_url"] == new_image_url
    assert updated_block["metadata_json"]["zoom"] == 1.25
    assert updated_block["metadata_json"]["image_position"] == "50% 15%"

    # 4. Verify public CMS endpoint returns the updated content
    pub_res = await client.get("/api/v1/cms/public")
    assert pub_res.status_code == 200
    pub_data = pub_res.json()
    pub_journey = next(s for s in pub_data["sections"] if s["section_key"] == "learning_journey")
    pub_first_block = next(b for b in pub_journey["blocks"] if b["id"] == first_block["id"])
    assert pub_first_block["title"] == "1. Înțelegi teoria (Test Actualizat)"
    assert pub_first_block["image_url"] == new_image_url
    assert pub_first_block["metadata_json"]["image_position"] == "50% 15%"
    assert pub_first_block["metadata_json"]["zoom"] == 1.25

    # 5. Restore original title
    await client.put(
        f"/api/v1/cms/blocks/{first_block['id']}",
        json={
            "title": "1. Înțelegi teoria",
            "image_url": "/images/journey_theory.jpg",
            "metadata_json": {
                "image_position_x": 50,
                "image_position_y": 15,
                "zoom": 1.0,
                "image_position": "center 15%"
            }
        },
        headers=headers
    )

@pytest.mark.asyncio
async def test_cms_unauthorized_access(client: AsyncClient):
    # Attempt update without admin token
    res = await client.put(
        "/api/v1/cms/sections/hero",
        json={"title": "Hacked Title"}
    )
    assert res.status_code in (401, 403)

