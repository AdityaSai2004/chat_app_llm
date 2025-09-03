from fastapi import FastAPI
from app.routes.auth import router as auth_router
from app.routes.room import router as room_router

app = FastAPI()

app.include_router(auth_router)
app.include_router(room_router)

@app.get("/")
def read_root():
    return {"message": "Hello World"}