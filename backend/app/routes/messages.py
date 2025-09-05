from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.rooms import Room
from app.models.user_room import UserRoom, RoomRole
from app.models.messages import Message
from app.utils.auth_utils import get_user_id_from_token
from app.db import get_db
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import uuid
from datetime import datetime
router = APIRouter()
bearer_scheme = HTTPBearer()


class SendMessageRequest(BaseModel):
    content: str

class SendMessageResponse(BaseModel):
    message_id: int
    room_code: str
    user_id: int
    content: str
    sent_at: datetime

class GetMessagesRequest(BaseModel):
    room_code: str

class GetMessagesResponse(BaseModel):
    messages: list[SendMessageResponse]

@router.post("/room/{room_code}/send_message", response_model=SendMessageResponse)
async def send_message(room_code: str, message: SendMessageRequest, db: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    user_id = get_user_id_from_token(credentials.credentials)
    room = db.query(Room).filter(Room.code == room_code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if not db.query(UserRoom).filter(UserRoom.room_id == room.id, UserRoom.user_id == user_id).first():
        raise HTTPException(status_code=403, detail="User not in room")
    created_at = datetime.utcnow()
    new_message = Message(
        room_id=room.id,
        user_id=user_id,
        content=message.content,
        created_at=created_at
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    return SendMessageResponse(
        message_id=new_message.id,
        room_code=room.code,
        user_id=user_id,
        content=new_message.content,
        sent_at=new_message.created_at
    )

@router.get("/room/{room_code}/messages", response_model=GetMessagesResponse)
async def get_messages(room_code: str, db: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    user_id = get_user_id_from_token(credentials.credentials)
    room = db.query(Room).filter(Room.code == room_code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if not db.query(UserRoom).filter(UserRoom.room_id == room.id, UserRoom.user_id == user_id).first():
        raise HTTPException(status_code=403, detail="User not in room")
    messages = db.query(Message).filter(Message.room_id == room.id).order_by(Message.created_at).all()
    response_messages = [
        SendMessageResponse(
            message_id=msg.id,
            room_code=room.code,
            user_id=msg.user_id,
            content=msg.content,
            sent_at=msg.created_at
        ) for msg in messages
    ]
    return GetMessagesResponse(messages=response_messages)