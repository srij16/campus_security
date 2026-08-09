from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from app.schemas.auth import Token
from jose import jwt, JWTError
from app.core.config import settings
from app.core.security import ALGORITHM

class AuthService:
    @staticmethod
    def register_user(db: Session, user_in: UserCreate) -> User:
        db_user = db.query(User).filter(User.email == user_in.email).first()
        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists."
            )
        hashed_password = get_password_hash(user_in.password)
        db_user = User(
            name=user_in.name,
            email=user_in.email,
            password_hash=hashed_password,
            role=user_in.role,
            department_id=user_in.department_id,
            is_active=True
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> User:
        user = db.query(User).filter(User.email == email).first()
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user

    @staticmethod
    def get_tokens_for_user(user: User) -> Token:
        from app.schemas.user import UserResponse
        access_token = create_access_token(subject=user.id, role=user.role.value)
        refresh_token = create_refresh_token(subject=user.id, role=user.role.value)
        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserResponse.model_validate(user)
        )

    @staticmethod
    def refresh_access_token(db: Session, refresh_token: str) -> Token:
        try:
            payload = jwt.decode(refresh_token, settings.JWT_SECRET_KEY, algorithms=[ALGORITHM])
            user_id: str = payload.get("sub")
            token_type: str = payload.get("type")
            if user_id is None or token_type != "refresh":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid refresh token",
                )
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )
        
        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if not user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user")

        return AuthService.get_tokens_for_user(user)
