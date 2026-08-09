import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException
from app.core.config import settings

# Configure Cloudinary
if settings.CLOUDINARY_URL:
    cloudinary.config(cloudinary_url=settings.CLOUDINARY_URL)
else:
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True
    )

class StorageService:
    @staticmethod
    def upload_image(file: UploadFile) -> dict:
        try:
            # Perform upload
            upload_result = cloudinary.uploader.upload(
                file.file,
                folder="campus_guardian",
                resource_type="image"
            )
            return {
                "secure_url": upload_result.get("secure_url"),
                "public_id": upload_result.get("public_id"),
                "bytes": upload_result.get("bytes", 0),
                "original_filename": file.filename
            }
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to upload image to Cloudinary: {str(e)}"
            )
