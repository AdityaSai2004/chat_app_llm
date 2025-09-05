from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.user import User
from app.utils.auth_utils import verify_password, create_access_token, hash_password, get_user_id_from_token
from app.db import get_db
from pydantic import BaseModel
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter()
bearer_scheme = HTTPBearer()

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/auth/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.id)})
    return {"user_name" : user.username, "access_token": token, "token_type": "bearer" }

@router.post("/auth/signup")
async def signup(request: LoginRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == request.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")
    new_user = User(username=request.username, hashed_password=hash_password(request.password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"detail": "User created successfully"}

@router.get("/auth/me")
async def get_current_user(db: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    user_id = get_user_id_from_token(credentials.credentials)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user_name": user.username}

# @router.post("/auth/logout")
# async def logout(db: Session = Depends(get_db)):
    
#     return {"detail": "User logged out successfully"} 