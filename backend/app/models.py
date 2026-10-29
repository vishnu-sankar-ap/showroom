from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Date, Float, ForeignKey
from .database import Base


def now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String)
    address = Column(String)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="customer")  # customer | admin


class Enquiry(Base):
    __tablename__ = "enquiries"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vehicle_name = Column(String, nullable=False)
    message = Column(String)
    status = Column(String, default="new")  # new | follow_up | sold | lost
    follow_up_date = Column(Date)
    notes = Column(String)
    created_at = Column(DateTime, default=now)


class ServiceRecord(Base):
    __tablename__ = "service_records"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vehicle_model = Column(String, nullable=False)
    reg_number = Column(String)
    service_date = Column(Date)
    description = Column(String)
    cost = Column(Float)
    insurance_provider = Column(String)
    insurance_expiry = Column(Date)