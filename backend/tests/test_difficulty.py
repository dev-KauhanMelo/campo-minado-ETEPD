from app.game.difficulty import DIFFICULTY_PRESETS, Difficulty


def test_easy_preset():
    config = DIFFICULTY_PRESETS[Difficulty.EASY]
    assert (config.rows, config.cols, config.mines) == (9, 9, 10)


def test_medium_preset():
    config = DIFFICULTY_PRESETS[Difficulty.MEDIUM]
    assert (config.rows, config.cols, config.mines) == (16, 16, 40)


def test_hard_preset():
    config = DIFFICULTY_PRESETS[Difficulty.HARD]
    assert (config.rows, config.cols, config.mines) == (16, 30, 99)


def test_all_difficulties_have_a_preset():
    assert set(DIFFICULTY_PRESETS.keys()) == set(Difficulty)
