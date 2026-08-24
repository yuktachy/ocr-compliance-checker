from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List, Optional
import os
import uuid
import shutil

from ..services.rule_engine import analyze_package_images

router = APIRouter(prefix="/analyze", tags=["Analyze ML Engine"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "upload")
os.makedirs(UPLOAD_DIR, exist_ok=True)
@router.post("/")
async def analyze_package(
    files: Optional[List[UploadFile]] = File(None),
    product_name_hint: Optional[str] = Form(None)
):
    saved_file_paths = []

    if files:
        for file in files:
            file_extension = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
            unique_filename = f"{uuid.uuid4().hex}{file_extension}"
            file_dest = os.path.join(UPLOAD_DIR, unique_filename)
            
            with open(file_dest, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            relative_url = f"/upload/{unique_filename}"
            saved_file_paths.append(relative_url)

    if not saved_file_paths:
        saved_file_paths = ["/upload/sample_package.jpg"]

    analysis_result = analyze_package_images(
        image_paths=saved_file_paths,
        hint_name=product_name_hint
    )

    return analysis_result
