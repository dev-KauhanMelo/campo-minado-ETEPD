import { Link } from 'react-router-dom'

import Confetti from './Confetti'

const DIFFICULTY_LABELS = {
  facil: 'Fácil',
  medio: 'Médio',
  dificil: 'Difícil',
}

function formatTime(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds ?? 0))
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

function GameOverPanel({ status, difficulty, elapsedSeconds }) {
  const won = status === 'won'

  return (
    <div
      className={`flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl bg-surface p-6 text-center shadow-lg ${
        won ? '' : 'animate-shake'
      }`}
    >
      {won && <Confetti />}
      <p className="font-display text-3xl font-extrabold text-ink">
        {won ? 'Você venceu! 🎉' : 'Você perdeu 💥'}
      </p>
      <div className="flex gap-6 font-body text-ink-soft">
        <span>⏱ {formatTime(elapsedSeconds)}</span>
        <span>{DIFFICULTY_LABELS[difficulty] ?? difficulty}</span>
      </div>
      <div className="mt-2 flex w-full flex-col gap-3">
        <Link
          to="/novo-jogo"
          className="rounded-full bg-accent px-6 py-3 font-display font-bold text-white shadow transition active:scale-95"
        >
          Jogar novamente
        </Link>
        <Link
          to="/ranking"
          className="rounded-full border-2 border-accent bg-surface px-6 py-3 font-display font-bold text-accent transition active:scale-95"
        >
          Ver ranking
        </Link>
      </div>
    </div>
  )
}

export default GameOverPanel
