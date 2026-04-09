from datetime import datetime

from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user_role: str
    user: "LoginUser"


class LoginUser(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    created_at: datetime


class UserRegister(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: str = "user"


class UserSignup(BaseModel):
    email: EmailStr
    full_name: str
    password: str
