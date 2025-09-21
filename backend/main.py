from fastapi import FastAPI, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.routes.auth import router as auth_router
from app.routes.room import router as room_router
from app.routes.messages import router as messages_router
from app.routes.msg_socket import router as msg_socket_router
from llm.llm_queue import start_worker_pool
import asyncio
# Define HTTP Bearer token security scheme
bearer_scheme = HTTPBearer()

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    # Start the worker pool with 5 workers
    asyncio.create_task(start_worker_pool(5))

app.include_router(auth_router)
app.include_router(room_router)
app.include_router(messages_router)
app.include_router(msg_socket_router)

@app.get("/")
def read_root():
    return {"message": "Hello World"}