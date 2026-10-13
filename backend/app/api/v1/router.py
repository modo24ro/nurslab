from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, cms, courses, lessons, progress, quizzes,
    certificates, payments, workshops, home_nursing,
    articles, webinars, media, admin, health, search
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(cms.router, prefix="/cms", tags=["CMS & Page Builder"])
api_router.include_router(courses.router, prefix="/courses", tags=["Courses"])
api_router.include_router(lessons.router, prefix="/lessons", tags=["Lessons & Video"])
api_router.include_router(progress.router, prefix="/progress", tags=["Progress & Notes"])
api_router.include_router(quizzes.router, prefix="/quizzes", tags=["Quizzes & Evaluation"])
api_router.include_router(certificates.router, prefix="/certificates", tags=["Certificates"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments & Invoices"])
api_router.include_router(workshops.router, prefix="/workshops", tags=["Local Workshops"])
api_router.include_router(home_nursing.router, prefix="/home-nursing", tags=["Home Nursing"])
api_router.include_router(articles.router, prefix="/articles", tags=["Medical Publications"])
api_router.include_router(webinars.router, prefix="/webinars", tags=["Webinars & Guests"])
api_router.include_router(media.router, prefix="/media", tags=["Media Library"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin Portal"])
api_router.include_router(search.router, prefix="/search", tags=["Global Search"])
