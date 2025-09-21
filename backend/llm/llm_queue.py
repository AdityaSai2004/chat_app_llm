import asyncio
from collections import defaultdict
from app.models.messages import Message
from app.models.rooms import Room
from app.db import get_db
from app.utils.bot_utils import get_or_create_bot_user
from llm.command_message_queue import call_gemini_api  # import your Gemini API call
from sqlalchemy.orm import Session

# Global job queue
job_queue = asyncio.Queue()

# Per-room locks
room_locks = defaultdict(asyncio.Lock)

# Example job structure: (room_id, message_id, text, api_key)
class BotJob:
    def __init__(self, room_id, message_id, text, api_key):
        self.room_id = room_id
        self.message_id = message_id
        self.text = text
        self.api_key = api_key

async def enqueue_bot_job(room_id, message_id, text, api_key):
    await job_queue.put(BotJob(room_id, message_id, text, api_key))

async def worker_loop(worker_id):
    while True:
        job = await job_queue.get()
        lock = room_locks[job.room_id]
        async with lock:
            await process_bot_job(job)
        job_queue.task_done()

async def process_bot_job(job):
    # Get database session
    db: Session = next(get_db())
    
    # Get the room to fetch the API key
    room = db.query(Room).filter_by(id=job.room_id).first()
    if not room:
        print(f"Room {job.room_id} not found, skipping job")
        return
    
    # Broadcast start
    await broadcast_to_room(job.room_id, {
        "type": "bot_message_start",
        "message_id": job.message_id
    })

    # Call Gemini API with stream=True using the room's API key
    response_chunks = await call_gemini_api(job.text, room.api_key)
    
    # Stream each chunk to the room
    for chunk in response_chunks:
        await broadcast_to_room(job.room_id, {
            "type": "bot_message_delta",
            "message_id": job.message_id,
            "content": chunk
        })

    # Broadcast end
    await broadcast_to_room(job.room_id, {
        "type": "bot_message_end",
        "message_id": job.message_id
    })

    # Insert bot reply into DB and mark command as processed
    # Create the full response by joining all chunks
    full_response = "".join(response_chunks)
    
    # Get or create the bot user
    bot_user_id = get_or_create_bot_user(db)
    
    bot_message = Message(
        room_id=job.room_id,
        user_id=bot_user_id,  # Use the bot user's ID
        content=full_response,
        message_type="bot"
    )
    db.add(bot_message)
    
    # Mark original command as processed
    command_msg = db.query(Message).filter_by(id=job.message_id).first()
    if command_msg:
        command_msg.processed = True
    
    db.commit()
    db.close()

async def broadcast_to_room(room_id, message):
    # Implement this to send message over WebSocket to all clients in the room
    pass

async def start_worker_pool(num_workers=5):
    workers = [asyncio.create_task(worker_loop(i)) for i in range(num_workers)]
    await asyncio.gather(*workers)

# To start the worker pool at app startup:
# asyncio.create_task(start_worker_pool(5))