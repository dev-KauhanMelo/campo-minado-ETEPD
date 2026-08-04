from dataclasses import dataclass
from enum import Enum


class Difficulty(str, Enum):
    EASY = "facil"
    MEDIUM = "medio"
    HARD = "dificil"


@dataclass(frozen=True)
class DifficultyConfig:
    rows: int
    cols: int
    mines: int


DIFFICULTY_PRESETS: dict[Difficulty, DifficultyConfig] = {
    Difficulty.EASY: DifficultyConfig(rows=9, cols=9, mines=10),
    Difficulty.MEDIUM: DifficultyConfig(rows=16, cols=16, mines=40),
    Difficulty.HARD: DifficultyConfig(rows=16, cols=30, mines=99),
}
