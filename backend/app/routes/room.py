from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.rooms import Room
from app.utils.auth_utils import get_user_id_from_token
from app.db import get_db
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import uuid
from datetime import datetime
router = APIRouter()
bearer_scheme = HTTPBearer()


# Request model: only name
class RoomCreateRequest(BaseModel):
    name: str

# Response model: room_id, room_name, room_code
class RoomCreateResponse(BaseModel):
    room_id: int
    room_name: str
    room_code: str

class RoomRequest(BaseModel):
    room_code: str

class RoomResponse(BaseModel):
    room_id: int
    room_name: str
    room_code: str

@router.post("/create_room", response_model=RoomCreateResponse)
async def create_room(request: RoomCreateRequest, db: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    user_id = get_user_id_from_token(credentials.credentials)
    room_code = uuid.uuid4().hex[:8]
    new_room = Room(name=request.name, owner_id=user_id, code=room_code, created_at = datetime.utcnow())
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    return {"room_id": new_room.id, "room_name": new_room.name, "room_code": new_room.code}

@router.get("/rooms/{room_code}", response_model=RoomResponse)
async def get_room(room_code: str, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.code == room_code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return {"room_id": room.id, "room_name": room.name, "room_code": room.code}