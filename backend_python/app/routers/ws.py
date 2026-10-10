import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket_manager import ws_manager

router = APIRouter(prefix="/ws", tags=["WebSockets"])

@router.websocket("/orders/{order_id}")
async def websocket_order_tracking(websocket: WebSocket, order_id: str):
    channel = f"order_{order_id}"
    await ws_manager.connect(websocket, channel)
    try:
        # Send initial confirmation message
        await websocket.send_json({
            "event": "connected",
            "order_id": order_id,
            "message": f"Connected to live stream for order {order_id}"
        })
        while True:
            # Keep socket alive and respond to client pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_json({"event": "pong"})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, channel)
    except Exception:
        ws_manager.disconnect(websocket, channel)

@router.websocket("/admin")
async def websocket_admin_feed(websocket: WebSocket):
    channel = "admin"
    await ws_manager.connect(websocket, channel)
    try:
        await websocket.send_json({
            "event": "connected",
            "message": "Connected to SliceCraft admin live broadcast feed"
        })
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_json({"event": "pong"})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, channel)
    except Exception:
        ws_manager.disconnect(websocket, channel)

@router.websocket("/storefront")
async def websocket_storefront_feed(websocket: WebSocket):
    channel = "storefront"
    await ws_manager.connect(websocket, channel)
    try:
        await websocket.send_json({
            "event": "connected",
            "message": "Connected to SliceCraft storefront live menu feed"
        })
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_json({"event": "pong"})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, channel)
    except Exception:
        ws_manager.disconnect(websocket, channel)
