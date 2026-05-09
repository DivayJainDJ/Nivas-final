"""Complaint routing API endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.shared.logging.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)


class ComplaintRoutingRequest(BaseModel):
    """Request schema for complaint routing."""

    complaintId: str


@router.post("/api/router/route")
async def route_complaint(request: ComplaintRoutingRequest) -> dict:
    """Route a complaint after AI classification is complete."""
    try:
        from app.complaint_router.service import route_complaint_by_id

        result = route_complaint_by_id(request.complaintId.strip())
        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.message or "Complaint routing failed",
            )
        return {
            "success": result.success,
            "complaintId": result.complaintId,
            "routingStatus": result.routingStatus,
            "department": result.department,
            "assignedOfficer": result.assignedOfficer,
            "priority": result.priority,
            "escalated": result.escalated,
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("complaint_routing_endpoint_failed", error=str(exc))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Complaint routing failed: {exc}",
        ) from exc
