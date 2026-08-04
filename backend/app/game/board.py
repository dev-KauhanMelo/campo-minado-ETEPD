import random
from dataclasses import dataclass
from enum import Enum


class CellState(Enum):
    HIDDEN = "hidden"
    REVEALED = "revealed"
    FLAGGED = "flagged"


class GameStatus(Enum):
    IN_PROGRESS = "in_progress"
    WON = "won"
    LOST = "lost"


@dataclass
class Cell:
    is_mine: bool = False
    state: CellState = CellState.HIDDEN
    adjacent_mines: int = 0


class Board:
    """Tabuleiro de Campo Minado.

    As minas só são sorteadas no primeiro `reveal`, excluindo a célula
    clicada e seus vizinhos, para garantir que o primeiro clique nunca
    seja uma derrota.
    """

    def __init__(self, rows: int, cols: int, mine_count: int, rng: random.Random | None = None):
        if rows <= 0 or cols <= 0:
            raise ValueError("rows e cols devem ser positivos")
        if mine_count < 0 or mine_count >= rows * cols:
            raise ValueError("mine_count deve estar entre 0 e rows*cols - 1")

        self.rows = rows
        self.cols = cols
        self.mine_count = mine_count
        self.status = GameStatus.IN_PROGRESS
        self.mines_placed = False
        self.revealed_count = 0
        self._rng = rng or random.Random()
        self.cells: list[list[Cell]] = [
            [Cell() for _ in range(cols)] for _ in range(rows)
        ]

    def in_bounds(self, row: int, col: int) -> bool:
        return 0 <= row < self.rows and 0 <= col < self.cols

    def _neighbors(self, row: int, col: int):
        for dr in (-1, 0, 1):
            for dc in (-1, 0, 1):
                if dr == 0 and dc == 0:
                    continue
                nr, nc = row + dr, col + dc
                if self.in_bounds(nr, nc):
                    yield nr, nc

    def _place_mines(self, safe_row: int, safe_col: int) -> None:
        forbidden = {(safe_row, safe_col), *self._neighbors(safe_row, safe_col)}
        candidates = [
            (r, c)
            for r in range(self.rows)
            for c in range(self.cols)
            if (r, c) not in forbidden
        ]
        if len(candidates) < self.mine_count:
            # Tabuleiro pequeno demais para respeitar a zona segura em volta
            # do clique; garante só que a própria célula clicada fique livre.
            candidates = [
                (r, c)
                for r in range(self.rows)
                for c in range(self.cols)
                if (r, c) != (safe_row, safe_col)
            ]

        for r, c in self._rng.sample(candidates, self.mine_count):
            self.cells[r][c].is_mine = True

        for r in range(self.rows):
            for c in range(self.cols):
                cell = self.cells[r][c]
                if not cell.is_mine:
                    cell.adjacent_mines = sum(
                        1 for nr, nc in self._neighbors(r, c) if self.cells[nr][nc].is_mine
                    )

        self.mines_placed = True

    def reveal(self, row: int, col: int) -> None:
        if not self.in_bounds(row, col):
            raise ValueError("posição fora do tabuleiro")
        if self.status != GameStatus.IN_PROGRESS:
            return

        cell = self.cells[row][col]
        if cell.state != CellState.HIDDEN:
            return

        if not self.mines_placed:
            self._place_mines(row, col)

        if cell.is_mine:
            cell.state = CellState.REVEALED
            self.status = GameStatus.LOST
            self._reveal_all_mines()
            return

        self._flood_reveal(row, col)
        self._check_victory()

    def _flood_reveal(self, row: int, col: int) -> None:
        stack = [(row, col)]
        while stack:
            r, c = stack.pop()
            cell = self.cells[r][c]
            if cell.state != CellState.HIDDEN:
                continue
            cell.state = CellState.REVEALED
            self.revealed_count += 1
            if cell.adjacent_mines == 0:
                for nr, nc in self._neighbors(r, c):
                    neighbor = self.cells[nr][nc]
                    if neighbor.state == CellState.HIDDEN and not neighbor.is_mine:
                        stack.append((nr, nc))

    def _reveal_all_mines(self) -> None:
        for row in self.cells:
            for cell in row:
                if cell.is_mine:
                    cell.state = CellState.REVEALED

    def _check_victory(self) -> None:
        total_safe = self.rows * self.cols - self.mine_count
        if self.revealed_count >= total_safe:
            self.status = GameStatus.WON

    def toggle_flag(self, row: int, col: int) -> None:
        if not self.in_bounds(row, col):
            raise ValueError("posição fora do tabuleiro")
        if self.status != GameStatus.IN_PROGRESS:
            return

        cell = self.cells[row][col]
        if cell.state == CellState.HIDDEN:
            cell.state = CellState.FLAGGED
        elif cell.state == CellState.FLAGGED:
            cell.state = CellState.HIDDEN

    @property
    def flags_placed(self) -> int:
        return sum(
            1 for row in self.cells for cell in row if cell.state == CellState.FLAGGED
        )

    @property
    def flags_remaining(self) -> int:
        return self.mine_count - self.flags_placed
