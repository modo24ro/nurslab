import io
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.certificate import Certificate
from app.models.user import User
from app.schemas.certificate import CertificateResponse, CertificateVerifyResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/my", response_model=List[CertificateResponse])
async def get_my_certificates(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(
        select(Certificate)
        .where(Certificate.user_id == current_user.id)
        .order_by(Certificate.issue_date.desc())
    )
    certs = res.scalars().all()
    output = []
    for c in certs:
        obj = CertificateResponse(
            id=c.id,
            certificate_code=c.certificate_code,
            student_name=c.student_name,
            course_title=c.course_title,
            instructor_name=c.instructor_name,
            issue_date=c.issue_date,
            pdf_url=f"/api/v1/certificates/{c.id}/pdf",
            verification_url=f"/certificate/verify/{c.certificate_code}"
        )
        output.append(obj)
    return output

@router.get("/verify/{code}", response_model=CertificateVerifyResponse)
async def verify_certificate(code: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Certificate).where(Certificate.certificate_code == code.upper()))
    cert = res.scalar_one_or_none()
    if not cert:
        return CertificateVerifyResponse(
            is_valid=False,
            certificate_code=code,
            message="Certificatul specificat nu a fost găsit în baza de date securizată NursLab."
        )

    return CertificateVerifyResponse(
        is_valid=True,
        certificate_code=cert.certificate_code,
        student_name=cert.student_name,
        course_title=cert.course_title,
        instructor_name=cert.instructor_name,
        issue_date=cert.issue_date,
        verification_hash=cert.verification_hash,
        message="Certificat autentic verificat cu succes și eliberat de NursLab - Nursing Practice."
    )

@router.get("/{certificate_id}/pdf")
async def download_certificate_pdf(
    certificate_id: str,
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Certificate).where(Certificate.id == certificate_id))
    cert = res.scalar_one_or_none()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificat inexistent")

    # Generate PDF in memory using ReportLab
    from reportlab.lib.pagesizes import letter, landscape
    from reportlab.pdfgen import canvas
    from reportlab.lib import colors

    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=landscape(letter))
    width, height = landscape(letter)

    # Background frame
    p.setStrokeColor(colors.HexColor("#102B46"))
    p.setLineWidth(4)
    p.rect(30, 30, width - 60, height - 60)

    p.setStrokeColor(colors.HexColor("#116448"))
    p.setLineWidth(1.5)
    p.rect(38, 38, width - 76, height - 76)

    # Title
    p.setFont("Helvetica-Bold", 32)
    p.setFillColor(colors.HexColor("#102B46"))
    p.drawCentredString(width / 2.0, height - 100, "NursLab - Nursing Practice")

    p.setFont("Helvetica", 14)
    p.setFillColor(colors.HexColor("#116448"))
    p.drawCentredString(width / 2.0, height - 130, "CERTIFICAT DE ABSOLVIRE ȘI PERFECȚIONARE MEDICALĂ")

    # Recipient
    p.setFont("Helvetica", 12)
    p.setFillColor(colors.HexColor("#64748B"))
    p.drawCentredString(width / 2.0, height - 180, "Se acordă prezentul certificat doamnei / domnului:")

    p.setFont("Helvetica-Bold", 26)
    p.setFillColor(colors.HexColor("#102B46"))
    p.drawCentredString(width / 2.0, height - 225, cert.student_name)

    # Course
    p.setFont("Helvetica", 12)
    p.setFillColor(colors.HexColor("#64748B"))
    p.drawCentredString(width / 2.0, height - 270, "Pentru promovarea cu succes a programului de instruire:")

    p.setFont("Helvetica-Bold", 18)
    p.setFillColor(colors.HexColor("#116448"))
    p.drawCentredString(width / 2.0, height - 305, cert.course_title)

    # Details & verification
    p.setFont("Helvetica", 10)
    p.setFillColor(colors.HexColor("#475569"))
    date_str = cert.issue_date.strftime("%d.%m.%Y")
    p.drawString(60, 80, f"Data eliberării: {date_str}")
    p.drawString(60, 65, f"Cod unic verificare: {cert.certificate_code}")

    p.drawRightString(width - 60, 80, f"Formator: {cert.instructor_name}")
    p.drawRightString(width - 60, 65, "Platforma Medicală NursLab România")

    p.showPage()
    p.save()

    buffer.seek(0)
    filename = f"Certificat_NursLab_{cert.certificate_code}.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
