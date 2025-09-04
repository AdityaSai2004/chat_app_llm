from datetime import datetime
from enum import Enum
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SqlEnum
from sqlalchemy.orm import relationship
from .base import Base  # assuming you have a Base in models/base.py


# Define role types as an Enum
class RoomRole(str, Enum):
    OWNER = "owner"
    PARTICIPANT = "participant"
    BOT = "bot"


class UserRoom(Base):
    __tablename__ = "user_rooms"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)

    # Role of this user in the room
    role = Column(SqlEnum(RoomRole), nullable=False, default=RoomRole.PARTICIPANT)

    # When did this user join the room?
    joined_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="rooms")
    room = relationship("Room", back_populates="members")
