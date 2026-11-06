import uuid
from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=150)
    phone_number: Optional[str] = Field(None, max_length=30)


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=128)
    role: Optional[Literal["buyer", "agent", "admin"]] = "buyer"


class UserLogin(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None  # to support OAuth2 username field
    password: str


class UserResponse(UserBase):
    id: uuid.UUID
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user: UserResponse


class UserRoleUpdate(BaseModel):
    role: Literal["buyer", "agent", "admin"]
