import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import Base, engine, SessionLocal
from .security import hash_password
from .routers import auth, enquiries, services, insurance

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Showroom API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(enquiries.router)
app.include_router(services.router)
app.include_router(insurance.router)


@app.on_event("startup")
def create_default_admin():
    db = SessionLocal()
    try:
        if not db.query(models.User).filter_by(role="admin").first():
            db.add(models.User(
                customer_code="ADMIN",
                name="Showroom Admin",
                email=os.getenv("ADMIN_EMAIL", "admin@showroom.com"),
                hashed_password=hash_password(os.getenv("ADMIN_PASSWORD", "admin123")),
                role="admin",
            ))
            db.commit()
    finally:
        db.close()


@app.get("/health")
def health():
    return {"status": "ok"}