from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.schemas.user import UserResponse
from app.models.user import User
from app.utils.enums import UserRole

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/", response_model=list[UserResponse])
def get_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(User).all()

@router.get("/staff", response_model=list[UserResponse])
def get_staff(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Staff users for dropdowns
    return db.query(User).filter(User.role == UserRole.STAFF).all()
