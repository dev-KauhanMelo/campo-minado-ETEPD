import time
from dataclasses import dataclass

from app.game.board import Board
from app.game.difficulty import Difficulty


@dataclass
class GameSession:
    id: str
    difficulty: Difficulty
    board: Board
    started_at: float | None = None
    finished_at: float | None = None

    @property
    def elapsed_seconds(self) -> float | None:
        if self.started_at is None:
            return None
        end = self.finished_at if self.finished_at is not None else time.monotonic()
        return round(end - self.started_at, 1)


# Armazenamento em memória, único por processo — suficiente para o escopo
# do projeto (uma instância de backend). Se o backend precisar rodar com
# múltiplos workers/instâncias no futuro, isso precisará virar um store
# compartilhado (Redis, etc.).
_sessions: dict[str, GameSession] = {}


def save(session: GameSession) -> None:
    _sessions[session.id] = session


def get(game_id: str) -> GameSession | None:
    return _sessions.get(game_id)
