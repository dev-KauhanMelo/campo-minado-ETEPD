import time
from dataclasses import dataclass, field

from app.game.board import Board
from app.game.difficulty import Difficulty

# Sessões abandonadas (aba fechada no meio do jogo) nunca seriam removidas
# do dicionário. Como o processo é longo, isso vazaria memória — então
# sessões velhas são descartadas quando novas são criadas.
SESSION_TTL_SECONDS = 3 * 60 * 60


@dataclass
class GameSession:
    id: str
    difficulty: Difficulty
    board: Board
    started_at: float | None = None
    finished_at: float | None = None
    paused_at: float | None = None
    paused_total: float = 0.0
    created_at: float = field(default_factory=time.monotonic)

    @property
    def is_paused(self) -> bool:
        return self.paused_at is not None

    @property
    def elapsed_seconds(self) -> float | None:
        """Tempo de jogo, sem contar o que passou com o jogo pausado."""
        if self.started_at is None:
            return None
        if self.finished_at is not None:
            end = self.finished_at
        elif self.paused_at is not None:
            end = self.paused_at
        else:
            end = time.monotonic()
        return round(end - self.started_at - self.paused_total, 1)

    def pause(self) -> None:
        # Antes do primeiro clique o cronômetro nem começou, e depois do fim
        # do jogo ele já está congelado: nos dois casos pausar é inócuo.
        if self.started_at is None or self.finished_at is not None:
            return
        if self.paused_at is None:
            self.paused_at = time.monotonic()

    def resume(self) -> None:
        if self.paused_at is None:
            return
        self.paused_total += time.monotonic() - self.paused_at
        self.paused_at = None


# Armazenamento em memória, único por processo — suficiente para o escopo
# do projeto (uma instância de backend). Se o backend precisar rodar com
# múltiplos workers/instâncias no futuro, isso precisará virar um store
# compartilhado (Redis, etc.).
_sessions: dict[str, GameSession] = {}


def _drop_expired(now: float) -> None:
    expired = [
        game_id
        for game_id, session in _sessions.items()
        if now - session.created_at > SESSION_TTL_SECONDS
    ]
    for game_id in expired:
        del _sessions[game_id]


def save(session: GameSession) -> None:
    _drop_expired(time.monotonic())
    _sessions[session.id] = session


def get(game_id: str) -> GameSession | None:
    return _sessions.get(game_id)
