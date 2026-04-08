from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user_role: str


class UserRegister(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: str = "user"


class UserSignup(BaseModel):
    email: EmailStr
    full_name: str
    password: str
