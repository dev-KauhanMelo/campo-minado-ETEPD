import random

import pytest

from app.game.board import Board, CellState, GameStatus


def make_board_with_mines(rows, cols, mine_positions):
    """Cria um Board com minas fixas nas posições dadas, pulando o sorteio
    aleatório, para testes determinísticos de flood fill / contagem."""
    board = Board(rows, cols, mine_count=len(mine_positions))
    for r, c in mine_positions:
        board.cells[r][c].is_mine = True
    for r in range(rows):
        for c in range(cols):
            cell = board.cells[r][c]
            if not cell.is_mine:
                cell.adjacent_mines = sum(
                    1
                    for nr, nc in board._neighbors(r, c)
                    if board.cells[nr][nc].is_mine
                )
    board.mines_placed = True
    return board


class TestValidation:
    def test_invalid_rows_raises(self):
        with pytest.raises(ValueError):
            Board(0, 5, 1)

    def test_invalid_cols_raises(self):
        with pytest.raises(ValueError):
            Board(5, 0, 1)

    def test_mine_count_too_high_raises(self):
        with pytest.raises(ValueError):
            Board(2, 2, 4)

    def test_negative_mine_count_raises(self):
        with pytest.raises(ValueError):
            Board(2, 2, -1)


class TestFirstClickSafety:
    def test_first_click_never_hits_a_mine(self):
        # 3x3 com 8 minas (só sobra 1 célula segura): o clique deve cair
        # exatamente nessa célula, respeitando a regra de primeiro clique
        # seguro mesmo no caso extremo em que a "zona segura" não cabe.
        for seed in range(20):
            board = Board(3, 3, 8, rng=random.Random(seed))
            board.reveal(1, 1)
            assert board.cells[1][1].is_mine is False
            assert board.status != GameStatus.LOST

    def test_mine_count_matches_after_placement(self):
        board = Board(9, 9, 10, rng=random.Random(1))
        board.reveal(4, 4)
        placed = sum(cell.is_mine for row in board.cells for cell in row)
        assert placed == 10


class TestFloodFill:
    def test_reveals_connected_zero_region_and_its_border(self):
        # 5x5 sem minas: revelar qualquer célula deve revelar o tabuleiro
        # inteiro e vencer o jogo.
        board = make_board_with_mines(5, 5, [])
        board.reveal(2, 2)
        assert board.status == GameStatus.WON
        assert all(
            cell.state == CellState.REVEALED for row in board.cells for cell in row
        )

    def test_stops_at_numbered_border_without_crossing_it(self):
        # Coluna 2 inteira minada isola a coluna 3+ da coluna 0-1.
        board = make_board_with_mines(5, 5, [(r, 2) for r in range(5)])
        board.reveal(0, 0)

        for r in range(5):
            for c in (0, 1):
                assert board.cells[r][c].state == CellState.REVEALED
            for c in (3, 4):
                assert board.cells[r][c].state == CellState.HIDDEN
        assert board.status == GameStatus.IN_PROGRESS

    def test_adjacent_mine_count(self):
        board = make_board_with_mines(3, 3, [(1, 1)])
        assert board.cells[0][0].adjacent_mines == 1
        assert board.cells[0][2].adjacent_mines == 1
        assert board.cells[2][2].adjacent_mines == 1
        assert board.cells[1][0].adjacent_mines == 1


class TestLossAndWin:
    def test_revealing_a_mine_loses_and_reveals_all_mines(self):
        board = make_board_with_mines(3, 3, [(0, 0), (2, 2)])
        board.reveal(0, 0)
        assert board.status == GameStatus.LOST
        assert board.cells[0][0].state == CellState.REVEALED
        assert board.cells[2][2].state == CellState.REVEALED

    def test_win_when_all_safe_cells_revealed(self):
        board = make_board_with_mines(2, 2, [(1, 1)])
        board.reveal(0, 0)
        board.reveal(0, 1)
        board.reveal(1, 0)
        assert board.status == GameStatus.WON

    def test_actions_after_game_over_are_noop(self):
        board = make_board_with_mines(3, 3, [(0, 0)])
        board.reveal(0, 0)
        assert board.status == GameStatus.LOST

        board.reveal(1, 1)
        assert board.cells[1][1].state == CellState.HIDDEN

        board.toggle_flag(2, 2)
        assert board.cells[2][2].state == CellState.HIDDEN

    def test_revealing_already_revealed_cell_is_noop(self):
        board = make_board_with_mines(3, 3, [(0, 0), (2, 2)])
        board.reveal(1, 1)
        revealed_before = board.revealed_count

        board.reveal(1, 1)
        assert board.revealed_count == revealed_before
        assert board.status == GameStatus.IN_PROGRESS


class TestFlags:
    def test_toggle_flag_marks_and_unmarks(self):
        board = make_board_with_mines(3, 3, [(0, 0)])
        board.toggle_flag(1, 1)
        assert board.cells[1][1].state == CellState.FLAGGED
        assert board.flags_placed == 1
        assert board.flags_remaining == 0  # 1 mina - 1 bandeira

        board.toggle_flag(1, 1)
        assert board.cells[1][1].state == CellState.HIDDEN
        assert board.flags_placed == 0

    def test_flagging_a_revealed_cell_is_noop(self):
        board = make_board_with_mines(3, 3, [(0, 0), (2, 2)])
        board.reveal(1, 1)
        board.toggle_flag(1, 1)
        assert board.cells[1][1].state == CellState.REVEALED

    def test_revealing_a_flagged_cell_is_noop(self):
        board = make_board_with_mines(3, 3, [])
        board.toggle_flag(1, 1)
        board.reveal(1, 1)
        assert board.cells[1][1].state == CellState.FLAGGED


class TestBounds:
    def test_reveal_out_of_bounds_raises(self):
        board = make_board_with_mines(3, 3, [])
        with pytest.raises(ValueError):
            board.reveal(5, 5)

    def test_toggle_flag_out_of_bounds_raises(self):
        board = make_board_with_mines(3, 3, [])
        with pytest.raises(ValueError):
            board.toggle_flag(-1, 0)
