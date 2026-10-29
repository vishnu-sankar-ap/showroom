from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user, require_admin

router = APIRouter(prefix="/api/services", tags=["services"])


@router.post("", response_model=schemas.ServiceOut, status_code=201)
def add_service(data: schemas.ServiceCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    record = models.ServiceRecord(**data.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/mine", response_model=List[schemas.ServiceOut])
def my_services(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    return db.query(models.ServiceRecord).filter_by(user_id=user.id).all()


@router.get("", response_model=List[schemas.ServiceOut])
def all_services(db: Session = Depends(get_db), _=Depends(require_admin)):
    return db.query(models.ServiceRecord).all()