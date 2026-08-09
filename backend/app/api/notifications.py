from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.schemas.notification import NotificationResponse, UnreadCountResponse
from app.services.notification_service import NotificationService
from app.models.user import User
from app.models.notification import Notification

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/", response_model=list[NotificationResponse])
def get_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return NotificationService.get_notifications(db, current_user.id)

@router.get("/unread-count", response_model=UnreadCountResponse)
def get_unread_count(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()
    return {"unread_count": count}

@router.patch("/{id}/read", response_model=NotificationResponse)
def mark_notification_read(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notification = NotificationService.mark_as_read(db, id, current_user.id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification

@router.post("/read-all")
def mark_all_notifications_read(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    NotificationService.mark_all_as_read(db, current_user.id)
    return {"success": True, "message": "All notifications marked as read"}
