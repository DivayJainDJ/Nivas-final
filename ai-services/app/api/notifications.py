"""Notification broadcaster API endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.notification_broadcaster.schemas import NotificationPayload
from app.shared.logging.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)


@router.post("/api/notifications/send")
async def send_notification(payload: NotificationPayload) -> dict:
    """Broadcast a notification to matching users."""
    try:
        from app.notification_broadcaster.service import NotificationBroadcasterService

        service = NotificationBroadcasterService()
        result = service.broadcast_notification(payload)
        if result is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Notification broadcast failed",
            )
        return {
            "success": True,
            **result,
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("notification_endpoint_failed", error=str(exc))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Notification broadcast failed: {exc}",
        ) from exc
