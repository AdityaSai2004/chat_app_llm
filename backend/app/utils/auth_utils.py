from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta

SECRET_KEY = "your-secret-key"  # Change this in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user_id_from_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # print("Decoded JWT payload:", payload)
        user_id = payload.get("sub")
        # print("Extracted user_id (sub):", user_id)
        if user_id is None:
            print("Token missing 'sub' field.")
            raise ValueError("Invalid token")
        return int(user_id)
    except jwt.PyJWTError as e:
        print("JWT decode error:", e)
        raise ValueError("Invalid token")