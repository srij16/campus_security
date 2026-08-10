from pydantic import BaseModel, EmailStr
from typing import Optional
import datetime
from app.utils.enums import UserRole, UserStatus

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: UserRole
    department_id: Optional[int] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    department_id: Optional[int] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    status: UserStatus
    verified_at: Optional[datetime.datetime] = None
    verified_by_id: Optional[int] = None
    verification_reason: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class UserVerifyRequest(BaseModel):
    status: UserStatus
    reason: Optional[str] = None

class UserRoleUpdateRequest(BaseModel):
    role: UserRole

