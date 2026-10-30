from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user, require_admin, find_customer

router = APIRouter(prefix="/api/insurance", tags=["insurance"])


@router.post("", response_model=schemas.InsuranceOut, status_code=201)
def add_policy(data: schemas.InsuranceCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    customer = find_customer(db, data.customer_code)
    policy = models.Insurance(user_id=customer.id, **data.model_dump(exclude={"customer_code"}))
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy


@router.get("/mine", response_model=List[schemas.InsuranceOut])
def my_policies(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    return db.query(models.Insurance).filter_by(user_id=user.id).order_by(models.Insurance.expiry_date).all()


@router.get("", response_model=List[schemas.InsuranceOut])
def all_policies(db: Session = Depends(get_db), _=Depends(require_admin)):
    return db.query(models.Insurance).order_by(models.Insurance.expiry_date).all()