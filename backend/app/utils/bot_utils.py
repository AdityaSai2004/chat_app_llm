from sqlalchemy.orm import Session
from sqlalchemy import text
from app.utils.auth_utils import hash_password
from datetime import datetime

def get_or_create_bot_user(db: Session) -> int:
    """
    Get or create the system bot user.
    Returns the bot user ID.
    """
    bot_username = "system_bot"
    
    # Try to find existing bot user
    result = db.execute(
        text("SELECT id FROM users WHERE username = :username"), 
        {"username": bot_username}
    ).fetchone()
    
    if result:
        return result[0]  # Return existing bot user ID
    
    # Create the bot user
    hashed_pw = hash_password("bot_password_never_used")
    created_at = datetime.utcnow()
    
    result = db.execute(
        text("INSERT INTO users (username, hashed_password, created_at) VALUES (:username, :password, :created_at)"),
        {"username": bot_username, "password": hashed_pw, "created_at": created_at}
    )
    db.commit()
    
    # Get the newly created user ID
    result = db.execute(
        text("SELECT id FROM users WHERE username = :username"), 
        {"username": bot_username}
    ).fetchone()
    
    return result[0]