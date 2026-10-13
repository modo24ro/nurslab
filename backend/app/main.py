import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import engine, Base, AsyncSessionLocal
from app.api.v1.router import api_router
from app.services.seed_data import seed_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure upload directory exists
    os.makedirs(settings.MEDIA_UPLOAD_DIR, exist_ok=True)
    
    # Create tables if not existing
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Enable diacritic-insensitive search (ș/ţ/ă/î...) used by /search and course filters
    try:
        async with engine.begin() as conn:
            await conn.exec_driver_sql("CREATE EXTENSION IF NOT EXISTS unaccent")
    except Exception as e:
        print(f"unaccent extension notice: {e}")

    # Seed data
    async with AsyncSessionLocal() as session:
        try:
            await seed_database(session)
        except Exception as e:
            print(f"Seed data notice: {e}")

    yield

    # Shutdown
    await engine.dispose()

app = FastAPI(
    title=settings.APP_NAME,
    description="Enterprise-Grade Medical Learning & E-Learning Platform for Nursing Practice",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount media uploads for local development & container persistence
if os.path.exists(settings.MEDIA_UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.MEDIA_UPLOAD_DIR), name="uploads")

# Include versioned API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Global error on {request.method} {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "A apărut o eroare internă de server. Vă rugăm reîncercați."}
    )

@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "docs": "/docs",
        "api_v1": settings.API_V1_STR,
        "status": "online"
    }
