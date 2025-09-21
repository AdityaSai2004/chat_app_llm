#!/usr/bin/env python3
"""
Script to create the system bot user in the database.
Run this once to ensure the bot user exists.
"""

import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db import SessionLocal
from app.utils.bot_utils import get_or_create_bot_user

def create_bot_user():
    db = SessionLocal()
    try:
        bot_user_id = get_or_create_bot_user(db)
        print(f"Bot user created/found: ID={bot_user_id}")
    except Exception as e:
        print(f"Error creating bot user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_bot_user()