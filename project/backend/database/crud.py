from typing import Optional
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from . import models

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# User helpers

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, email: str, password: str) -> models.User:
    hashed_password = pwd_context.hash(password)
    user = models.User(email=email, password_hash=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def authenticate_user(db: Session, email: str, password: str) -> Optional[models.User]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user

# Job helpers

def create_job(db: Session, job_id: str, filename: str, tags: str, status: str = 'uploaded') -> models.Job:
    job = models.Job(job_id=job_id, filename=filename, tags=tags, status=status)
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def get_job(db: Session, job_id: str) -> Optional[models.Job]:
    return db.query(models.Job).filter(models.Job.job_id == job_id).first()


def list_jobs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Job).order_by(models.Job.created_at.desc()).offset(skip).limit(limit).all()


def update_job_status(db: Session, job_id: str, status: str) -> Optional[models.Job]:
    job = get_job(db, job_id)
    if job:
        job.status = status
        db.commit()
        db.refresh(job)
    return job
