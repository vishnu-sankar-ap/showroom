from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user, require_admin

router = APIRouter(prefix="/api/enquiries", tags=["enquiries"])


@router.post("", response_model=schemas.EnquiryOut, status_code=201)
def create_enquiry(data: schemas.EnquiryCreate, db: Session = Depends(get_db),
                   user: models.User = Depends(get_current_user)):
    enquiry = models.Enquiry(user_id=user.id, **data.model_dump())
    db.add(enquiry)
    db.commit()
    db.refresh(enquiry)
    return enquiry


@router.get("/mine", response_model=List[schemas.EnquiryOut])
def my_enquiries(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    return db.query(models.Enquiry).filter_by(user_id=user.id).all()


@router.get("", response_model=List[schemas.EnquiryOut])
def all_enquiries(db: Session = Depends(get_db), _=Depends(require_admin)):
    return db.query(models.Enquiry).order_by(models.Enquiry.created_at.desc()).all()


@router.patch("/{enquiry_id}", response_model=schemas.EnquiryOut)
def update_enquiry(enquiry_id: int, data: schemas.EnquiryUpdate,
                   db: Session = Depends(get_db), _=Depends(require_admin)):
    enquiry = db.get(models.Enquiry, enquiry_id)
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(enquiry, key, value)
    db.commit()
    db.refresh(enquiry)
    return enquiry