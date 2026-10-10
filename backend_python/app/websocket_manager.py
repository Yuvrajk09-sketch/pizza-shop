import logging
from typing import Dict, List
from fastapi import WebSocket

logger = logging.getLogger("uvicorn")

class ConnectionManager:
    def __init__(self):
        # Key: channel_name (e.g. "order_SC-12345" or "admin"), Value: list of active WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, channel: str):
        await websocket.accept()
        if channel not in self.active_connections:
            self.active_connections[channel] = []
        self.active_connections[channel].append(websocket)
        logger.info(f"WebSocket client connected to [{channel}]. Total in channel: {len(self.active_connections[channel])}")

    def disconnect(self, websocket: WebSocket, channel: str):
        if channel in self.active_connections:
            if websocket in self.active_connections[channel]:
                self.active_connections[channel].remove(websocket)
                logger.info(f"WebSocket client disconnected from [{channel}]. Remaining: {len(self.active_connections[channel])}")
            if len(self.active_connections[channel]) == 0:
                del self.active_connections[channel]

    async def broadcast(self, channel: str, message: dict):
        if channel in self.active_connections:
            dead_connections = []
            for connection in self.active_connections[channel]:
                try:
                    await connection.send_json(message)
                except Exception as exc:
                    logger.warning(f"Error sending message on [{channel}]: {exc}")
                    dead_connections.append(connection)
            for dead in dead_connections:
                self.disconnect(dead, channel)

    async def broadcast_order_update(self, order_id: str, event_type: str, data: dict):
        payload = {
            "event": event_type,
            "order_id": order_id,
            "data": data
        }
        # Send to customer channel
        await self.broadcast(f"order_{order_id}", payload)
        # Send to admin channel
        await self.broadcast("admin", payload)

ws_manager = ConnectionManager()
