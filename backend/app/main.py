import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routers import auth, users, uploads

app = FastAPI(title="RoomieMatch API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads/avatars", exist_ok=True)
app.mount("/static/avatars", StaticFiles(directory="uploads/avatars"), name="avatars")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(uploads.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
