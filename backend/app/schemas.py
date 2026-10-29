from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict


class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    address: Optional[str] = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: EmailStr
    phone: Optional[str]
    address: Optional[str]
    role: str


class EnquiryCreate(BaseModel):
    vehicle_name: str
    message: Optional[str] = None


class EnquiryUpdate(BaseModel):
    status: Optional[str] = None
    follow_up_date: Optional[date] = None
    notes: Optional[str] = None


class EnquiryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    vehicle_name: str
    message: Optional[str]
    status: str
    follow_up_date: Optional[date]
    notes: Optional[str]
    created_at: datetime


class ServiceCreate(BaseModel):
    user_id: int
    vehicle_model: str
    reg_number: Optional[str] = None
    service_date: Optional[date] = None
    description: Optional[str] = None
    cost: Optional[float] = None
    insurance_provider: Optional[str] = None
    insurance_expiry: Optional[date] = None


class ServiceOut(ServiceCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int