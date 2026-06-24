# ClearVision AI Satellite Imagery

ClearVision AI is a deep learning-powered platform designed to remove cloud cover from LISS-IV GeoTIFF satellite imagery. This repository contains the complete stack, including a modern React frontend and a FastAPI backend that handles ML model inference.

## Features
- **Modern UI**: Sleek, responsive interface built with React, Vite, and Tailwind CSS.
- **GeoTIFF Uploads**: Easy-to-use file upload system specifically for `.tif` and `.tiff` satellite images.
- **FastAPI Backend**: High-performance asynchronous API for processing image generation tasks.
- **Background Processing**: Integrated with Celery and Redis to handle long-running ML inference jobs.

## Project Structure

```
Hackthon-CLOUD IMAGERY/
├── project/
│   ├── backend/        # FastAPI application, ML models, and Celery tasks
│   └── frontend/       # React + Vite frontend application
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- Redis (for Celery background tasks)

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd project/backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables:**
   A `.env` file should be present in `project/backend/` with the following variables:
   ```env
   CELERY_BROKER_URL=redis://localhost:6379/0
   UPLOAD_DIR=storage/uploads
   OUTPUT_DIR=storage/outputs
   MAX_FILE_SIZE_MB=50
   ```

4. **Start the FastAPI server:**
   Go back to the root `project` directory and run:
   ```bash
   cd project
   uvicorn backend.app:app --host 0.0.0.0 --port 8000
   ```
   The API will be available at `http://localhost:8000`.

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd project/frontend
   ```

2. **Install Node dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The UI will be accessible at `http://localhost:5173`.

## Usage
1. Open the frontend in your browser (`http://localhost:5173`).
2. Click on **Upload GeoTIFF** to select a LISS-IV satellite image.
3. Upon successful upload, a unique Job ID will be generated.
4. Click **Process Image** to trigger the cloud-removal inference process.
5. The processed image and evaluation metrics (PSNR, SSIM, SAM) will be returned.