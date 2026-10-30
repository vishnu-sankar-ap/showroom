from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Date, Float, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base


def now():
    return datetime.now(timezone.utc)


class OwnerInfo:
    """Lets API responses include the customer's code and name."""

    @property
    def customer_code(self):
        return self.user.customer_code if self.user else None

    @property
    def customer_name(self):
        return self.user.name if self.user else None


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    customer_code = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String)
    address = Column(String)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="customer")  # customer | admin


class Enquiry(OwnerInfo, Base):
    __tablename__ = "enquiries"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vehicle_name = Column(String, nullable=False)
    message = Column(String)
    status = Column(String, default="new")  # new | follow_up | sold | lost
    follow_up_date = Column(Date)
    notes = Column(String)
    created_at = Column(DateTime, default=now)
    user = relationship("User")


class ServiceRecord(OwnerInfo, Base):
    __tablename__ = "service_records"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vehicle_model = Column(String, nullable=False)
    reg_number = Column(String)
    service_date = Column(Date)
    description = Column(String)
    cost = Column(Float)
    user = relationship("User")


class Insurance(OwnerInfo, Base):
    __tablename__ = "insurance"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vehicle_model = Column(String, nullable=False)
    reg_number = Column(String)
    provider = Column(String, nullable=False)
    policy_number = Column(String)
    start_date = Column(Date)
    expiry_date = Column(Date, nullable=False)
    premium = Column(Float)
    user = relationship("User")