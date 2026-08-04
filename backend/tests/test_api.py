import time

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def start_game(difficulty="facil"):
    response = client.post("/game/start", json={"difficulty": difficulty})
    assert response.status_code == 200
    return response.json()


class TestStartGame:
    def test_creates_a_hidden_board_with_correct_dimensions(self):
        data = start_game("facil")
        assert data["rows"] == 9
        assert data["cols"] == 9
        assert data["mine_count"] == 10
        assert data["flags_remaining"] == 10
        assert data["status"] == "in_progress"
        assert data["elapsed_seconds"] is None
        assert len(data["cells"]) == 9
        assert len(data["cells"][0]) == 9
        assert all(cell["state"] == "hidden" for row in data["cells"] for cell in row)

    def test_invalid_difficulty_is_rejected(self):
        response = client.post("/game/start", json={"difficulty": "impossivel"})
        assert response.status_code == 422


class TestReveal:
    def test_first_reveal_starts_the_timer_and_reveals_cells(self):
        game = start_game("facil")
        response = client.post(
            "/game/reveal", json={"game_id": game["game_id"], "row": 4, "col": 4}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["elapsed_seconds"] is not None
        revealed = [
            cell for row in data["cells"] for cell in row if cell["state"] == "revealed"
        ]
        assert len(revealed) >= 1

    def test_unknown_game_id_returns_404(self):
        response = client.post(
            "/game/reveal", json={"game_id": "nao-existe", "row": 0, "col": 0}
        )
        assert response.status_code == 404

    def test_out_of_bounds_reveal_returns_400(self):
        game = start_game("facil")
        response = client.post(
            "/game/reveal", json={"game_id": game["game_id"], "row": 99, "col": 99}
        )
        assert response.status_code == 400

    def test_playing_until_game_over_reveals_consistent_state(self):
        game = start_game("facil")
        game_id = game["game_id"]
        status = "in_progress"
        for row in range(9):
            if status != "in_progress":
                break
            for col in range(9):
                if status != "in_progress":
                    break
                response = client.post(
                    "/game/reveal", json={"game_id": game_id, "row": row, "col": col}
                )
                status = response.json()["status"]

        assert status in ("won", "lost")
        final = client.get(f"/game/{game_id}").json()
        assert final["elapsed_seconds"] is not None

        if status == "lost":
            assert any(cell.get("is_mine") for row in final["cells"] for cell in row)
        else:
            hidden_non_mine = [
                cell
                for row in final["cells"]
                for cell in row
                if cell["state"] == "hidden" and not cell.get("is_mine")
            ]
            assert hidden_non_mine == []


class TestFlag:
    def test_toggle_flag_updates_flags_remaining(self):
        game = start_game("facil")
        response = client.post(
            "/game/flag", json={"game_id": game["game_id"], "row": 0, "col": 0}
        )
        data = response.json()
        assert data["flags_remaining"] == game["flags_remaining"] - 1
        assert data["cells"][0][0]["state"] == "flagged"

        response = client.post(
            "/game/flag", json={"game_id": game["game_id"], "row": 0, "col": 0}
        )
        data = response.json()
        assert data["flags_remaining"] == game["flags_remaining"]
        assert data["cells"][0][0]["state"] == "hidden"

    def test_unknown_game_id_returns_404(self):
        response = client.post(
            "/game/flag", json={"game_id": "nao-existe", "row": 0, "col": 0}
        )
        assert response.status_code == 404


class TestPause:
    def test_pause_freezes_the_timer_and_resume_continues_it(self):
        game = start_game("facil")
        game_id = game["game_id"]
        client.post("/game/reveal", json={"game_id": game_id, "row": 4, "col": 4})

        paused = client.post("/game/pause", json={"game_id": game_id}).json()
        assert paused["paused"] is True
        frozen = paused["elapsed_seconds"]

        time.sleep(0.15)
        assert client.get(f"/game/{game_id}").json()["elapsed_seconds"] == frozen

        resumed = client.post("/game/resume", json={"game_id": game_id}).json()
        assert resumed["paused"] is False
        # O tempo parado não pode ter sido contado no cronômetro.
        assert resumed["elapsed_seconds"] == pytest.approx(frozen, abs=0.05)

    def test_moves_are_rejected_while_paused(self):
        game = start_game("facil")
        game_id = game["game_id"]
        client.post("/game/reveal", json={"game_id": game_id, "row": 4, "col": 4})
        client.post("/game/pause", json={"game_id": game_id})

        assert (
            client.post(
                "/game/reveal", json={"game_id": game_id, "row": 0, "col": 0}
            ).status_code
            == 409
        )
        assert (
            client.post(
                "/game/flag", json={"game_id": game_id, "row": 0, "col": 0}
            ).status_code
            == 409
        )

        client.post("/game/resume", json={"game_id": game_id})
        assert (
            client.post(
                "/game/flag", json={"game_id": game_id, "row": 0, "col": 0}
            ).status_code
            == 200
        )

    def test_pause_before_first_move_keeps_timer_unstarted(self):
        game = start_game("facil")
        data = client.post("/game/pause", json={"game_id": game["game_id"]}).json()
        assert data["paused"] is False
        assert data["elapsed_seconds"] is None

    def test_unknown_game_id_returns_404(self):
        assert (
            client.post("/game/pause", json={"game_id": "nao-existe"}).status_code == 404
        )
        assert (
            client.post("/game/resume", json={"game_id": "nao-existe"}).status_code
            == 404
        )


class TestGetGame:
    def test_returns_current_state(self):
        game = start_game("medio")
        response = client.get(f"/game/{game['game_id']}")
        assert response.status_code == 200
        assert response.json()["game_id"] == game["game_id"]

    def test_unknown_game_id_returns_404(self):
        response = client.get("/game/nao-existe")
        assert response.status_code == 404
