from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "nurslab_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
)

@celery_app.task(name="app.core.celery_app.send_email_notification")
def send_email_notification(to_email: str, subject: str, message: str):
    print(f"[CELERY EMAIL] To: {to_email} | Subject: {subject} | Content: {message}")
    return {"status": "sent", "to": to_email}

@celery_app.task(name="app.core.celery_app.generate_certificate_pdf")
def generate_certificate_pdf(certificate_id: str, student_name: str, course_title: str):
    print(f"[CELERY CERTIFICATE] Generating PDF for {student_name} - {course_title}")
    return {"status": "generated", "certificate_id": certificate_id}
