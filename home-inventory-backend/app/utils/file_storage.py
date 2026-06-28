import os
import uuid
from pathlib import Path

import aiofiles
from fastapi import UploadFile

from app.core.config import settings


ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


async def save_upload(file: UploadFile, subfolder: str = "items") -> dict:
    if file.content_type not in ALLOWED_TYPES:
        raise ValueError(f"File type {file.content_type} not allowed")

    content = await file.read()
    size_mb = len(content) / (1024 * 1024)
    if size_mb > settings.MAX_IMAGE_SIZE_MB:
        raise ValueError(f"File too large. Max {settings.MAX_IMAGE_SIZE_MB}MB")

    ext = Path(file.filename or "image.jpg").suffix or ".jpg"
    filename = f"{uuid.uuid4()}{ext}"
    upload_dir = Path(settings.UPLOAD_DIR) / subfolder
    upload_dir.mkdir(parents=True, exist_ok=True)
    filepath = upload_dir / filename

    async with aiofiles.open(filepath, "wb") as f:
        await f.write(content)

    return {
        "url": f"/uploads/{subfolder}/{filename}",
        "filename": file.filename or filename,
        "file_size": len(content),
        "mime_type": file.content_type,
    }


def delete_file(url: str) -> None:
    if url.startswith("/uploads/"):
        rel = url.lstrip("/")
        path = Path(settings.UPLOAD_DIR).parent / rel
        if path.exists():
            path.unlink(missing_ok=True)
