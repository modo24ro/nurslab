import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.config import settings
from app.models.cms import MediaAsset
from app.api.deps import get_current_admin

router = APIRouter()

ALLOWED_MIME_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "application/pdf": ".pdf",
}

@router.post("/upload")
async def upload_media_file(
    file: UploadFile = File(...),
    alt_text: str = "",
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_admin)
):
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Tip de fișier nepermis: {file.content_type}. Permise: JPG, PNG, WEBP, SVG, PDF."
        )

    ext = ALLOWED_MIME_TYPES[file.content_type]
    file_id = uuid.uuid4().hex
    filename = f"{file_id}{ext}"
    os.makedirs(settings.MEDIA_UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.MEDIA_UPLOAD_DIR, filename)

    contents = await file.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"Fișierul depășește limita maximă de {settings.MAX_UPLOAD_SIZE_MB} MB"
        )

    with open(file_path, "wb") as f:
        f.write(contents)

    file_url = f"/uploads/{filename}"
    media_asset = MediaAsset(
        file_name=file.filename or filename,
        file_url=file_url,
        file_type=file.content_type,
        file_size_bytes=len(contents),
        alt_text=alt_text or file.filename
    )
    db.add(media_asset)
    await db.commit()
    await db.refresh(media_asset)

    return {
        "id": media_asset.id,
        "file_name": media_asset.file_name,
        "file_url": media_asset.file_url,
        "file_size_bytes": media_asset.file_size_bytes,
        "alt_text": media_asset.alt_text
    }

@router.get("/")
async def list_media_assets(
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_admin)
):
    res = await db.execute(select(MediaAsset).order_by(MediaAsset.created_at.desc()))
    assets = res.scalars().all()
    return assets
