from fastapi import APIRouter, Depends, UploadFile, File
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.storage_service import StorageService

router = APIRouter(prefix="/upload", tags=["Image Upload"])

@router.post("")
def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    upload_res = StorageService.upload_image(file)
    return {
        "url": upload_res.get("secure_url"),
        "public_id": upload_res.get("public_id"),
        "filename": upload_res.get("original_filename"),
        "size": upload_res.get("bytes")
    }
