import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.games import router as games_router

DEFAULT_ORIGINS = ["http://localhost:5173"]
extra_origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", "").split(",")
    if origin.strip()
]

app = FastAPI(title="Campo Minado ETEPD API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=DEFAULT_ORIGINS + extra_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(games_router)


@app.get("/health")
def health():
    return {"status": "ok"}
