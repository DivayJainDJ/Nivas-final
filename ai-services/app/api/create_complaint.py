"""Complaint creation API."""

from __future__ import annotations

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.complaint_classifier.schemas import CreateComplaintResponse
from app.shared.logging.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)


@router.post("/api/complaints/create", response_model=CreateComplaintResponse)
@router.post("/complaints/create", response_model=CreateComplaintResponse, include_in_schema=False)
async def create_complaint(
    image: UploadFile = File(...),
    description: str = Form(""),
    latitude: float = Form(0.0),
    longitude: float = Form(0.0),
    address: str = Form(""),
    userId: str = Form(...),
):
    try:
        from app.complaint_classifier.service import create_complaint_document, upload_image_to_storage

        if not userId.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="userId is required",
            )

        image_url, storage_path = await upload_image_to_storage(image)
        complaint_id = create_complaint_document(
            description=description,
            image_url=image_url,
            latitude=latitude,
            longitude=longitude,
            address=address,
            user_id=userId,
            storage_path=storage_path,
        )

        logger.info("complaint_created", complaint_id=complaint_id, user_id=userId)
        return {
            "success": True,
            "complaintId": complaint_id,
            "status": "processing",
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("complaint_creation_failed", error=str(exc))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Complaint creation failed: {exc}",
        ) from exc
