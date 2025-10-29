from sqlalchemy.orm import Session
from models.notification import Notification
from models.shopping import ShoppingList, SharedList
from models.expense import ExpenseGroup, GroupMember
from typing import List
import asyncio
from websocket_manager import manager
import logging

logger = logging.getLogger(__name__)

def create_notification(
    db: Session,
    user_id: int,
    notification_type: str,
    title: str,
    message: str,
    reference_id: int = None,
    reference_type: str = None
):
    """Create a notification for a user"""
    notification = Notification(
        user_id=user_id,
        type=notification_type,
        title=title,
        message=message,
        reference_id=reference_id,
        reference_type=reference_type,
        is_read=False
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)

    # Send push notification via WebSocket if user is connected
    if manager.is_user_connected(user_id):
        notification_data = {
            "type": "notification",
            "id": notification.id,
            "title": notification.title,
            "message": notification.message,
            "notification_type": notification.type,
            "reference_id": notification.reference_id,
            "reference_type": notification.reference_type,
            "created_at": notification.created_at.isoformat(),
            "is_read": notification.is_read
        }

        # Try to send WebSocket message
        try:
            # Get the running event loop
            loop = asyncio.get_running_loop()
            # Schedule the coroutine in the event loop
            asyncio.ensure_future(manager.send_personal_message(notification_data, user_id), loop=loop)
        except RuntimeError:
            # No event loop running, this is expected in sync context
            # The notification is still saved in DB and will be fetched on next poll
            logger.debug(f"No event loop available to send WebSocket notification to user {user_id}")
        except Exception as e:
            logger.error(f"Error sending WebSocket notification: {e}")

    return notification

def notify_shopping_list_members(
    db: Session,
    shopping_list_id: int,
    notification_type: str,
    title: str,
    message: str,
    exclude_user_id: int = None
):
    """Notify all members of a shopping list except the one who performed the action"""
    shopping_list = db.query(ShoppingList).filter(ShoppingList.id == shopping_list_id).first()
    if not shopping_list:
        return

    # Get all shared users
    shared_users = db.query(SharedList).filter(SharedList.shopping_list_id == shopping_list_id).all()

    # Get owner ID
    owner_id = shopping_list.owner_id

    # Notify owner if not excluded
    if owner_id != exclude_user_id:
        create_notification(
            db=db,
            user_id=owner_id,
            notification_type=notification_type,
            title=title,
            message=message,
            reference_id=shopping_list_id,
            reference_type="shopping_list"
        )

    # Notify shared users
    for shared in shared_users:
        if shared.shared_with_id != exclude_user_id:
            create_notification(
                db=db,
                user_id=shared.shared_with_id,
                notification_type=notification_type,
                title=title,
                message=message,
                reference_id=shopping_list_id,
                reference_type="shopping_list"
            )

def notify_expense_group_members(
    db: Session,
    group_id: int,
    notification_type: str,
    title: str,
    message: str,
    exclude_user_id: int = None
):
    """Notify all members of an expense group except the one who performed the action"""
    group = db.query(ExpenseGroup).filter(ExpenseGroup.id == group_id).first()
    if not group:
        return

    # Get all group members
    members = db.query(GroupMember).filter(GroupMember.group_id == group_id).all()

    # Notify all members except the one who performed the action
    for member in members:
        if member.user_id != exclude_user_id:
            create_notification(
                db=db,
                user_id=member.user_id,
                notification_type=notification_type,
                title=title,
                message=message,
                reference_id=group_id,
                reference_type="expense_group"
            )
