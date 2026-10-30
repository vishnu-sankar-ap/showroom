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
    customer_code: Optional[str]
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
    customer_code: Optional[str]
    customer_name: Optional[str]
    vehicle_name: str
    message: Optional[str]
    status: str
    follow_up_date: Optional[date]
    notes: Optional[str]
    created_at: datetime


class ServiceCreate(BaseModel):
    customer_code: str
    vehicle_model: str
    reg_number: Optional[str] = None
    service_date: Optional[date] = None
    description: Optional[str] = None
    cost: Optional[float] = None


class ServiceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    customer_code: Optional[str]
    customer_name: Optional[str]
    vehicle_model: str
    reg_number: Optional[str]
    service_date: Optional[date]
    description: Optional[str]
    cost: Optional[float]


class InsuranceCreate(BaseModel):
    customer_code: str
    vehicle_model: str
    reg_number: Optional[str] = None
    provider: str
    policy_number: Optional[str] = None
    start_date: Optional[date] = None
    expiry_date: date
    premium: Optional[float] = None


class InsuranceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    customer_code: Optional[str]
    customer_name: Optional[str]
    vehicle_model: str
    reg_number: Optional[str]
    provider: str
    policy_number: Optional[str]
    start_date: Optional[date]
    expiry_date: date
    premium: Optional[float]