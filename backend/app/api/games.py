import time
from uuid import uuid4

from fastapi import APIRouter, HTTPException

from app.api.schemas import (
    CellPositionRequest,
    CellView,
    GameIdRequest,
    GameStateResponse,
    StartGameRequest,
)
from app.api.sessions import GameSession, get, save
from app.game.board import Board, Cell, CellState, GameStatus
from app.game.difficulty import DIFFICULTY_PRESETS

router = APIRouter(prefix="/game", tags=["game"])


def _get_session_or_404(game_id: str) -> GameSession:
    session = get(game_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Jogo não encontrado")
    return session


def _reject_if_paused(session: GameSession) -> None:
    # O cronômetro fica congelado enquanto pausado; aceitar jogadas aqui
    # deixaria o tempo do ranking menor que o tempo real de jogo.
    if session.is_paused:
        raise HTTPException(status_code=409, detail="Jogo pausado")


def _serialize_cell(cell: Cell, game_over: bool) -> CellView:
    if cell.state == CellState.REVEALED:
        return CellView(
            state=cell.state.value,
            adjacent_mines=cell.adjacent_mines,
            is_mine=cell.is_mine or None,
        )
    if game_over and cell.is_mine:
        return CellView(state=cell.state.value, is_mine=True)
    return CellView(state=cell.state.value)


def _serialize(session: GameSession) -> GameStateResponse:
    board = session.board
    game_over = board.status != GameStatus.IN_PROGRESS
    return GameStateResponse(
        game_id=session.id,
        difficulty=session.difficulty,
        rows=board.rows,
        cols=board.cols,
        mine_count=board.mine_count,
        status=board.status.value,
        paused=session.is_paused,
        flags_remaining=board.flags_remaining,
        elapsed_seconds=session.elapsed_seconds,
        cells=[[_serialize_cell(cell, game_over) for cell in row] for row in board.cells],
    )


@router.post("/start", response_model=GameStateResponse)
def start_game(payload: StartGameRequest) -> GameStateResponse:
    config = DIFFICULTY_PRESETS[payload.difficulty]
    board = Board(config.rows, config.cols, config.mines)
    session = GameSession(id=str(uuid4()), difficulty=payload.difficulty, board=board)
    save(session)
    return _serialize(session)


@router.get("/{game_id}", response_model=GameStateResponse)
def get_game(game_id: str) -> GameStateResponse:
    return _serialize(_get_session_or_404(game_id))


@router.post("/pause", response_model=GameStateResponse)
def pause_game(payload: GameIdRequest) -> GameStateResponse:
    session = _get_session_or_404(payload.game_id)
    session.pause()
    return _serialize(session)


@router.post("/resume", response_model=GameStateResponse)
def resume_game(payload: GameIdRequest) -> GameStateResponse:
    session = _get_session_or_404(payload.game_id)
    session.resume()
    return _serialize(session)


@router.post("/reveal", response_model=GameStateResponse)
def reveal_cell(payload: CellPositionRequest) -> GameStateResponse:
    session = _get_session_or_404(payload.game_id)
    _reject_if_paused(session)
    board = session.board
    was_placed = board.mines_placed

    try:
        board.reveal(payload.row, payload.col)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if not was_placed and board.mines_placed:
        session.started_at = time.monotonic()
    if board.status != GameStatus.IN_PROGRESS and session.finished_at is None:
        session.finished_at = time.monotonic()

    return _serialize(session)


@router.post("/flag", response_model=GameStateResponse)
def toggle_flag(payload: CellPositionRequest) -> GameStateResponse:
    session = _get_session_or_404(payload.game_id)
    _reject_if_paused(session)

    try:
        session.board.toggle_flag(payload.row, payload.col)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return _serialize(session)
