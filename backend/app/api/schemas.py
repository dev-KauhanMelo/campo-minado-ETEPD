from pydantic import BaseModel

from app.game.difficulty import Difficulty


class StartGameRequest(BaseModel):
    difficulty: Difficulty


class GameIdRequest(BaseModel):
    game_id: str


class CellPositionRequest(BaseModel):
    game_id: str
    row: int
    col: int


class CellView(BaseModel):
    state: str
    adjacent_mines: int | None = None
    is_mine: bool | None = None


class GameStateResponse(BaseModel):
    game_id: str
    difficulty: Difficulty
    rows: int
    cols: int
    mine_count: int
    status: str
    paused: bool = False
    flags_remaining: int
    elapsed_seconds: float | None = None
    cells: list[list[CellView]]
