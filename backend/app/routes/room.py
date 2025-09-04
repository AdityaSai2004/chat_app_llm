from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.rooms import Room
from app.models.user_room import UserRoom, RoomRole
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


class RoomUser(BaseModel):
    user_id: int
    role: str

class RoomResponse(BaseModel):
    room_id: int
    room_name: str
    room_code: str
    users: list[RoomUser]

class JoinRoomRequest(BaseModel):
    room_code: str

class JoinRoomResponse(BaseModel):
    room_name: str
    room_code: str
    joined_at: datetime



@router.post("/create_room", response_model=RoomCreateResponse)
async def create_room(request: RoomCreateRequest, db: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    user_id = get_user_id_from_token(credentials.credentials)
    room_code = uuid.uuid4().hex[:8]
    # if room name exists, return error
    existing_room = db.query(Room).filter(Room.name == request.name).first()
    if existing_room:
        raise HTTPException(status_code=400, detail="Room name already exists")
    # if room code exists, regenerate
    while db.query(Room).filter(Room.code == room_code).first():
        room_code = uuid.uuid4().hex[:8]
    new_room = Room(name=request.name, owner_id=user_id, code=room_code, created_at = datetime.utcnow())
    db.add(new_room)
    db.commit()
    db.refresh(new_room)

    # Add creator to user_rooms table as owner
    creator_user_room = UserRoom(user_id=user_id, room_id=new_room.id, role=RoomRole.OWNER)
    db.add(creator_user_room)
    db.commit()

    return {"room_id": new_room.id, "room_name": new_room.name, "room_code": new_room.code}

@router.get("/rooms/{room_code}", response_model=RoomResponse)
async def get_room(room_code: str, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.code == room_code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    # Get all users mapped to this room
    user_rooms = db.query(UserRoom).filter(UserRoom.room_id == room.id).all()
    users = [RoomUser(user_id=ur.user_id, role=ur.role.value if hasattr(ur.role, 'value') else ur.role) for ur in user_rooms]
    return {
        "room_id": room.id,
        "room_name": room.name,
        "room_code": room.code,
        "users": users
    }

@router.post("/rooms/{room_code}/join", response_model=JoinRoomResponse)
async def join_room(room_code: str, db: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    user_id = get_user_id_from_token(credentials.credentials)
    room = db.query(Room).filter(Room.code == room_code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    # Check if user is already a member
    existing_membership = db.query(UserRoom).filter(UserRoom.user_id == user_id, UserRoom.room_id == room.id).first()
    if existing_membership:
        return {"room_name": room.name, "room_code": room.code, "joined_at": existing_membership.joined_at}
    
    # Add user to room as participant
    new_membership = UserRoom(user_id=user_id, room_id=room.id, role=RoomRole.PARTICIPANT)
    db.add(new_membership)
    db.commit()
    db.refresh(new_membership)

    return {"room_name": room.name, "room_code": room.code, "joined_at": new_membership.joined_at}