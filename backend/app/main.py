from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.games import router as games_router

app = FastAPI(title="Campo Minado ETEPD API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(games_router)


@app.get("/health")
def health():
    return {"status": "ok"}
