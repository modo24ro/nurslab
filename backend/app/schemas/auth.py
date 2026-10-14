from typing import Optional
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    hospital_affiliation: Optional[str] = None
    nursing_specialty: Optional[str] = None

class UserCreateAdmin(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole = UserRole.STUDENT
    is_active: bool = True
    is_verified: bool = True
    phone: Optional[str] = None
    hospital_affiliation: Optional[str] = None
    nursing_specialty: Optional[str] = None
    bio: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    hospital_affiliation: Optional[str] = None
    nursing_specialty: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

class UserUpdateAdmin(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    phone: Optional[str] = None
    hospital_affiliation: Optional[str] = None
    nursing_specialty: Optional[str] = None
    bio: Optional[str] = None
    password: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool
    is_verified: bool
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    hospital_affiliation: Optional[str] = None
    nursing_specialty: Optional[str] = None
    bio: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenRefresh(BaseModel):
    refresh_token: str
