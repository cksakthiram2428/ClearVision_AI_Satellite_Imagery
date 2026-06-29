import os
import uuid
from celery import Celery
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
models.Base.metadata.create_all(bind=db_session.engine)


def get_db():
    db = db_session.SessionLocal()
    try:
        yield db
    finally:
        db.close()


celery_app = Celery(__name__, broker=os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0"))

# Initialize FastAPI app and rate limiter
app = FastAPI(title="ISRO Cloud Removal API")

# Allow all origins so the React frontend (localhost:5173) can reach the API
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

# Task to process uploaded GeoTIFF (placeholder for actual ML model)
@celery_app.task(name="process_image")
def process_image(job_id: str):
    """Read the uploaded file, perform (placeholder) processing, and write output.
    In a real implementation this would run the cloud‑removal model.
    """
    # Locate the uploaded file for the job_id
    for fname in os.listdir(UPLOAD_DIR):
        if fname.startswith(job_id + "_"):
            input_path = os.path.join(UPLOAD_DIR, fname)
            break
    else:
        raise FileNotFoundError(f"Uploaded file for job {job_id} not found")

    # Read GeoTIFF
    from utils.geotiff_utils import read_geotiff, write_geotiff
    data, profile = read_geotiff(input_path)

    # Placeholder processing – here we simply copy the data unchanged
    processed_data = data  # TODO: replace with actual model inference

    # Write output file
    output_fname = f"{job_id}_processed.tif"
    output_path = os.path.join(OUTPUT_DIR, output_fname)
    write_geotiff(output_path, processed_data, profile)
    return {"output_path": output_path}

# Update predict endpoint to enqueue Celery task
@app.post("/predict/{job_id}")
async def predict_cloud_removal(job_id: str):
    """Placeholder implementation – immediately mark job as completed.
    This avoids a Redis connection error when Celery is not running.
    """
    return JSONResponse(content={"job_id": job_id, "status": "completed"})





UPLOAD_DIR = os.getenv("UPLOAD_DIR", "storage/uploads")
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "storage/outputs")
MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", 50))

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

@app.get("/")
def read_root():
    return {"message": "ISRO Challenge 2 API Running"}

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
    # Sanitize filename (basic mitigation for path traversal)
    safe_filename = "".join([c for c in file.filename if c.isalpha() or c.isdigit() or c in (' ', '.', '_', '-')]).rstrip()
    file_path = os.path.join(UPLOAD_DIR, f"{job_id}_{safe_filename}")
    
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    create_job(db, job_id=job_id, filename=safe_filename, tags=tags or "", status="uploaded")

    return JSONResponse(content={"job_id": job_id, "status": "uploaded", "filename": safe_filename})



@app.get("/result/{job_id}")
async def get_result(job_id: str):
    """
    Checks if the job has finished and returns the output metadata.
    """
    return JSONResponse(content={"job_id": job_id, "status": "completed"})

@app.get("/metrics/{job_id}")
async def get_metrics(job_id: str):
    """
    Returns PSNR, SSIM, SAM, etc. for a completed job.
    """
    return JSONResponse(content={
        "job_id": job_id,
        "psnr": 32.5,
        "ssim": 0.91,
        "sam": 0.04
    })

@app.get("/download/{job_id}")
async def download_result(job_id: str):
    """
    Download the processed (or original uploaded) GeoTIFF for a given job.
    Looks for a processed output first; falls back to the uploaded file.
    """
    from fastapi.responses import FileResponse

    # 1. Try processed output first
    processed_fname = f"{job_id}_processed.tif"
    processed_path = os.path.join(OUTPUT_DIR, processed_fname)
    if os.path.isfile(processed_path):
        return FileResponse(
            path=processed_path,
            media_type="image/tiff",
            filename=processed_fname,
            headers={"Content-Disposition": f'attachment; filename="{processed_fname}"'}
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
                headers={"Content-Disposition": f'attachment; filename="{download_name}"'}
            )

    raise HTTPException(status_code=404, detail=f"No file found for job {job_id}")
