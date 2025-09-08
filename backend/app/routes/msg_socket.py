from fastapi.websockets import WebSocket, WebSocketDisconnect
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.rooms import Room
from app.models.user_room import UserRoom
from app.models.messages import Message
from app.utils.auth_utils import get_user_id_from_token
from app.db import get_db
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import asyncio

router = APIRouter()
bearer_scheme = HTTPBearer()

# Track active connections
active_connections = {}

@router.websocket("/ws")
async def websocket(websocket: WebSocket):
    await websocket.accept()
    
    # Send welcome message
    await websocket.send_json({"msg": "Hello WebSocket"})
    
    # Keep connection open and handle messages
    try:
        while True:
            # Wait for messages from the client
            data = await websocket.receive_text()
            
            # Echo the message back (for testing)
            await websocket.send_json({
                "received": data,
                "message": "Message received and processed"
            })
            
    except WebSocketDisconnect:
        # Handle client disconnect
        print("Client disconnected")

# For room-specific WebSockets (future implementation)
@router.websocket("/ws/room/{room_code}")
async def room_websocket(websocket: WebSocket, room_code: str):
    # Extract token from query params
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008)
        return

    # Get user ID from token
    try:
        user_id = get_user_id_from_token(token)
    except Exception:
        await websocket.close(code=1008)
        return


    # Find the room by code
    db: Session = next(get_db())
    room = db.query(Room).filter_by(code=room_code).first()
    if not room:
        await websocket.close(code=1008)
        return

    # Check if user has access to the room
    user_room = db.query(UserRoom).filter_by(user_id=user_id, room_id=room.id).first()
    if not user_room:
        await websocket.close(code=1008)
        return

    await websocket.accept()
    
    # Track this connection in the room
    if room_code not in active_connections:
        active_connections[room_code] = []
    active_connections[room_code].append(websocket)
    
    try:
        # Send welcome message
        await websocket.send_json({"msg": f"Connected to room {room_code}"})
        
        # Keep connection open and handle messages
        while True:
            # Continuously poll for new messages in the room
            last_message_id = None
            while True:
                # Check for new messages in the database
                db: Session = next(get_db())
                query = db.query(Message).filter_by(room_id=room.id)
                if last_message_id:
                    query = query.filter(Message.id > last_message_id)
                new_messages = query.order_by(Message.id.asc()).all()

                if new_messages:
                    for msg in new_messages:
                        # Broadcast new message to all clients in this room
                        for connection in active_connections[room_code]:
                            await connection.send_json({
                                "room": room_code,
                                "message": msg.content,
                                "sender_id": msg.user_id,
                                "timestamp": msg.created_at.isoformat() if msg.created_at else None
                            })
                    last_message_id = new_messages[-1].id

                # Sleep briefly to avoid hammering the DB
                await asyncio.sleep(1)
                
    except WebSocketDisconnect:
        # Remove this connection when client disconnects
        active_connections[room_code].remove(websocket)
        if not active_connections[room_code]:
            del active_connections[room_code]
