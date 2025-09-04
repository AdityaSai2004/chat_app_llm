
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from .base import Base
from sqlalchemy.orm import relationship

class Room(Base):
	__tablename__ = "rooms"

	id = Column(Integer, primary_key=True, index=True)
	name = Column(String(100), nullable=False)
	code = Column(String(16), unique=True, nullable=False, index=True)
	owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
	created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
	members = relationship("UserRoom", back_populates="room")