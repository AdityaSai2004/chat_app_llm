from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from .base import Base

class User(Base):
	__tablename__ = "users"

	id = Column(Integer, primary_key=True, index=True)
	username = Column(String(50), unique=True, nullable=False, index=True)
	hashed_password = Column(String(128), nullable=False)
	created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
