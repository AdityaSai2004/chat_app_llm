from sqlalchemy import Column, Integer, ForeignKey, DateTime
from datetime import datetime
from .base import Base

class UserRoom(Base):
    __tablename__ = "user_rooms"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow, nullable=False)
