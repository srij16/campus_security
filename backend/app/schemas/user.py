from pydantic import BaseModel, EmailStr
from typing import Optional
import datetime
from app.utils.enums import UserRole

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
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True
