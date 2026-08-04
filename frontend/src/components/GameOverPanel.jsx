import { useState } from 'react'
import { Link } from 'react-router-dom'

import { saveScore } from '../lib/ranking'
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

function GameOverPanel({ status, difficulty, elapsedSeconds, playerName }) {
  const won = status === 'won'
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved | error

  async function handleSave() {
    setSaveState('saving')
    try {
      await saveScore({ playerName, difficulty, timeSeconds: elapsedSeconds })
      setSaveState('saved')
    } catch {
      setSaveState('error')
    }
  }

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

      {won && (
        <div className="w-full">
          {saveState === 'saved' ? (
            <p className="font-body text-sm font-semibold text-success">
              Resultado salvo no ranking! ✅
            </p>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={saveState === 'saving'}
              className="w-full rounded-full bg-gold px-6 py-3 font-display font-bold text-ink shadow transition active:scale-95 disabled:opacity-60"
            >
              {saveState === 'saving' ? 'Salvando…' : `Salvar como "${playerName}"`}
            </button>
          )}
          {saveState === 'error' && (
            <p className="mt-1 font-body text-sm text-danger">
              Não foi possível salvar. Tente novamente.
            </p>
          )}
        </div>
      )}

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
