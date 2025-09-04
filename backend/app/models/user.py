from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from .base import Base
from sqlalchemy.orm import relationship

class User(Base):
	__tablename__ = "users"

	id = Column(Integer, primary_key=True, index=True)
	username = Column(String(50), unique=True, nullable=False, index=True)
	hashed_password = Column(String(128), nullable=False)
	created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
	rooms = relationship("UserRoom", back_populates="user")