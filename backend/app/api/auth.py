from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.schemas.user import UserCreate, UserResponse
from app.schemas.auth import Token, LoginRequest, RefreshRequest
from app.services.auth_service import AuthService
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    user = AuthService.register_user(db, user_in)
    return AuthService.get_tokens_for_user(user)

@router.post("/login", response_model=Token)
def login(login_req: LoginRequest, db: Session = Depends(get_db)):
    user = AuthService.authenticate_user(db, login_req.email, login_req.password)
    return AuthService.get_tokens_for_user(user)

@router.post("/refresh", response_model=Token)
def refresh(refresh_req: RefreshRequest, db: Session = Depends(get_db)):
    return AuthService.refresh_access_token(db, refresh_req.refresh_token)

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"success": True, "message": "Logged out successfully"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
