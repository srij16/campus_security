from fastapi import APIRouter, Depends, UploadFile, File
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["AI Integration"])

@router.post("/analyze")
async def analyze_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    # Read image bytes
    contents = await file.read()
    # Perform analysis
    result = await AIService.analyze_image_bytes(contents, file.content_type)
    return result
