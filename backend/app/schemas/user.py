from pydantic import BaseModel, EmailStr, ConfigDict
from config.validation import UserRole
from typing import Optional

from config.validation import UserRole

class UserBase(BaseModel):
    email : EmailStr
    password : str

# Signup
class UserCreate(UserBase):
    role : UserRole

# Login
class UserLogin(BaseModel):
    # Accept plain string for login so users can provide username or email
    email: str
    password: str

class UserResponse(BaseModel):
    id : int 
    email : EmailStr
    role : UserRole 
    is_active: bool

    model_config = ConfigDict(from_attributes = True)

class Token(BaseModel):
    access_token : str 
    refresh_token : Optional[str] = None
    token_type : str

class RefreshTokenRequest(BaseModel):
    refresh_token : str


