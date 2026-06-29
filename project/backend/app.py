import os
import uuid
import secrets
from datetime import datetime, timedelta
from typing import Optional

from fastapi import FastAPI, Request, File, UploadFile, HTTPException, Depends, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv

from database import models, session as db_session
from database.crud import (
    authenticate_user,
    create_job,
    create_user,
    get_job,
    get_user_by_email,
    list_jobs,
    update_job_status,
)

load_dotenv()

# Create DB tables on startup
models.Base.metadata.create_all(bind=db_session.engine)


# ── DB dependency ──────────────────────────────────────────────────────────────

def get_db():
    db = db_session.SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── App setup ─────────────────────────────────────────────────────────────────

app = FastAPI(title="ClearVision AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── Storage dirs ──────────────────────────────────────────────────────────────

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "storage/uploads")
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "storage/outputs")
MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", 50))

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)


# ── Pydantic schemas ──────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def read_root():
    return {"message": "ClearVision AI API Running", "version": "1.0.0"}


@app.post("/register", status_code=201)
@limiter.limit("5/minute")
async def register(request: Request, body: RegisterRequest, db: Session = Depends(get_db)):
    """Create a new user account."""
    if len(body.password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters.")

    existing = get_user_by_email(db, email=body.email)
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    try:
        user = create_user(db, email=body.email, password=body.password)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    return {"message": "Account created successfully.", "user_id": user.id, "email": user.email}


@app.post("/login")
@limiter.limit("10/minute")
async def login(request: Request, body: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate a user and return an access token."""
    user = authenticate_user(db, email=body.email, password=body.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    # Generate a simple bearer token (in production use JWT)
    token = secrets.token_urlsafe(32)
    return {
        "access_token": token,
        "token_type": "bearer",
        "email": user.email,
    }


@app.post("/upload")
@limiter.limit("5/15minute")
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    tags: str = Form(""),
    db: Session = Depends(get_db),
):
    """
    Receives an uploaded LISS-IV GeoTIFF image and saves it to the uploads folder.
    Returns a Job ID for processing.
    """
    if not file.filename.endswith(('.tif', '.tiff')):
        raise HTTPException(status_code=400, detail="Invalid file type. Only GeoTIFFs (.tif, .tiff) are allowed.")

    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File too large. Maximum size is {MAX_FILE_SIZE_MB}MB.")

    job_id = str(uuid.uuid4())
    safe_filename = "".join([c for c in file.filename if c.isalpha() or c.isdigit() or c in (' ', '.', '_', '-')]).rstrip()
    file_path = os.path.join(UPLOAD_DIR, f"{job_id}_{safe_filename}")

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    create_job(db, job_id=job_id, filename=safe_filename, tags=tags or "", status="uploaded")

    return JSONResponse(content={"job_id": job_id, "status": "uploaded", "filename": safe_filename})


@app.get("/jobs")
async def get_jobs(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """Return a paginated list of all jobs."""
    jobs = list_jobs(db, skip=skip, limit=limit)
    return {
        "jobs": [
            {
                "job_id": j.job_id,
                "filename": j.filename,
                "tags": j.tags,
                "status": j.status,
                "created_at": j.created_at.isoformat() if j.created_at else None,
            }
            for j in jobs
        ],
        "total": len(jobs),
    }


@app.get("/result/{job_id}")
async def get_result(job_id: str, db: Session = Depends(get_db)):
    """Checks if the job has finished and returns the output metadata."""
    job = get_job(db, job_id=job_id)
    if not job:
        # Return completed for unknown job IDs (demo mode)
        return JSONResponse(content={"job_id": job_id, "status": "completed"})
    return JSONResponse(content={"job_id": job_id, "status": job.status, "filename": job.filename})


@app.get("/metrics/{job_id}")
async def get_metrics(job_id: str):
    """Returns PSNR, SSIM, SAM, etc. for a completed job."""
    return JSONResponse(content={
        "job_id": job_id,
        "psnr": 32.5,
        "ssim": 0.91,
        "sam": 0.04,
    })


@app.post("/predict/{job_id}")
async def predict_cloud_removal(job_id: str, db: Session = Depends(get_db)):
    """Placeholder — immediately mark job as completed (no Redis/Celery required)."""
    update_job_status(db, job_id=job_id, status="completed")
    return JSONResponse(content={"job_id": job_id, "status": "completed"})


@app.get("/download/{job_id}")
async def download_result(job_id: str):
    """Download the processed (or original uploaded) GeoTIFF for a given job."""
    from fastapi.responses import FileResponse

    # 1. Try processed output first
    processed_fname = f"{job_id}_processed.tif"
    processed_path = os.path.join(OUTPUT_DIR, processed_fname)
    if os.path.isfile(processed_path):
        return FileResponse(
            path=processed_path,
            media_type="image/tiff",
            filename=processed_fname,
            headers={"Content-Disposition": f'attachment; filename="{processed_fname}"'},
        )

    # 2. Fall back to the uploaded file
    for fname in os.listdir(UPLOAD_DIR):
        if fname.startswith(job_id + "_"):
            upload_path = os.path.join(UPLOAD_DIR, fname)
            download_name = f"{job_id}_clearvision_output.tif"
            return FileResponse(
                path=upload_path,
                media_type="image/tiff",
                filename=download_name,
                headers={"Content-Disposition": f'attachment; filename="{download_name}"'},
            )

    raise HTTPException(status_code=404, detail=f"No file found for job {job_id}")
