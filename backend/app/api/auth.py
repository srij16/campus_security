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

import httpx
from fastapi import HTTPException
from app.schemas.auth import GoogleLoginRequest
from app.core.config import settings
from app.utils.enums import UserRole, UserStatus

@router.post("/google", response_model=Token)
async def google_login(login_req: GoogleLoginRequest, db: Session = Depends(get_db)):
    url = f"{settings.SUPABASE_URL}/auth/v1/user"
    headers = {
        "Authorization": f"Bearer {login_req.token}",
        "apikey": settings.SUPABASE_PUBLISHABLE_KEY
    }
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url, headers=headers)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Failed to communicate with Supabase Auth: {str(e)}"
            )
            
    if resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Supabase or Google session"
        )
        
    user_info = resp.json()
    supabase_uid = user_info.get("id")
    email = user_info.get("email")
    user_metadata = user_info.get("user_metadata", {})
    name = user_metadata.get("full_name") or user_metadata.get("name") or email.split("@")[0]
    
    user = db.query(User).filter(User.auth_user_id == supabase_uid).first()
    if not user:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.auth_user_id = supabase_uid
            db.commit()
            db.refresh(user)
        else:
            user = User(
                name=name,
                email=email,
                auth_user_id=supabase_uid,
                role=UserRole.STUDENT,
                status=UserStatus.PENDING,
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
    if user.status == UserStatus.SUSPENDED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been suspended. Please contact the administrator."
        )
        
    return AuthService.get_tokens_for_user(user)

