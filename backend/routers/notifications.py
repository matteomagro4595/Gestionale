from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.user import User
from models.notification import Notification
from schemas.notification import Notification as NotificationSchema, NotificationMarkRead
from auth import get_current_user
from websocket_manager import manager
from jose import JWTError, jwt
from config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/", response_model=List[NotificationSchema])
def get_notifications(
    skip: int = 0,
    limit: int = 50,
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get notifications for the current user"""
    query = db.query(Notification).filter(Notification.user_id == current_user.id)

    if unread_only:
        query = query.filter(Notification.is_read == False)

    notifications = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    return notifications

@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get count of unread notifications"""
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()
    return {"count": count}

@router.put("/{notification_id}/mark-read", response_model=NotificationSchema)
def mark_notification_read(
    notification_id: int,
    data: NotificationMarkRead,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a notification as read/unread"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notifica non trovata"
        )

    notification.is_read = data.is_read
    db.commit()
    db.refresh(notification)
    return notification

@router.put("/mark-all-read")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark all notifications as read"""
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "Tutte le notifiche sono state segnate come lette"}

@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a notification"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notifica non trovata"
        )

    db.delete(notification)
    db.commit()
    return {"message": "Notifica eliminata"}

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = None):
    """WebSocket endpoint for real-time notifications"""
    if not token:
        await websocket.close(code=1008, reason="Missing authentication token")
        return

    # Verify token and get user
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            await websocket.close(code=1008, reason="Invalid token")
            return
    except JWTError:
        await websocket.close(code=1008, reason="Invalid token")
        return

    # Get user from database
    db = next(get_db())
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            await websocket.close(code=1008, reason="User not found")
            return

        # Connect user
        await manager.connect(websocket, user.id)
        logger.info(f"WebSocket connected for user {user.id} ({user.email})")

        try:
            # Keep connection alive and handle incoming messages
            while True:
                # Wait for any message from client (ping/pong to keep alive)
                data = await websocket.receive_text()
                # Echo back to confirm connection is alive
                await websocket.send_json({"type": "pong", "message": "Connection alive"})
        except WebSocketDisconnect:
            logger.info(f"WebSocket disconnected for user {user.id}")
        except Exception as e:
            logger.error(f"WebSocket error for user {user.id}: {e}")
        finally:
            manager.disconnect(websocket, user.id)
    finally:
        db.close()
