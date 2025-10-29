from typing import Dict, Set
from fastapi import WebSocket
import json
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Store active connections: {user_id: Set[WebSocket]}
        self.active_connections: Dict[int, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        """Accept and store a new WebSocket connection for a user"""
        await websocket.accept()

        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()

        self.active_connections[user_id].add(websocket)
        logger.info(f"User {user_id} connected. Total connections for user: {len(self.active_connections[user_id])}")

    def disconnect(self, websocket: WebSocket, user_id: int):
        """Remove a WebSocket connection"""
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)

            # Clean up empty sets
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

            logger.info(f"User {user_id} disconnected. Remaining connections: {len(self.active_connections.get(user_id, []))}")

    async def send_personal_message(self, message: dict, user_id: int):
        """Send a message to all connections of a specific user"""
        if user_id not in self.active_connections:
            return

        # Create a copy of the set to avoid modification during iteration
        connections = self.active_connections[user_id].copy()

        for websocket in connections:
            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.error(f"Error sending message to user {user_id}: {e}")
                # Remove failed connection
                self.disconnect(websocket, user_id)

    async def broadcast_to_users(self, message: dict, user_ids: list):
        """Broadcast a message to multiple users"""
        for user_id in user_ids:
            await self.send_personal_message(message, user_id)

    def get_connected_users(self) -> Set[int]:
        """Get set of currently connected user IDs"""
        return set(self.active_connections.keys())

    def is_user_connected(self, user_id: int) -> bool:
        """Check if a user has any active connections"""
        return user_id in self.active_connections and len(self.active_connections[user_id]) > 0


# Global instance
manager = ConnectionManager()
