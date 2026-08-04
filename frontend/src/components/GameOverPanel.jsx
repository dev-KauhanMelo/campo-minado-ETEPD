import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { saveScore } from '../lib/ranking'
import { loadBests, recordBest } from '../lib/storage'
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

function GameOverPanel({ status, difficulty, elapsedSeconds, profile, onPlayAgain }) {
  const won = status === 'won'
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved | error

  // A comparação é feita na renderização e a gravação no efeito de
  // propósito: se o efeito fizesse as duas coisas, a segunda execução
  // (StrictMode em dev, ou qualquer remontagem) leria o tempo que ele
  // mesmo acabou de gravar e nunca reconheceria o recorde.
  const [isRecord] = useState(() => {
    if (!won) return false
    const anterior = loadBests()[difficulty]
    return anterior == null || elapsedSeconds < anterior
  })

  useEffect(() => {
    if (won) recordBest(difficulty, elapsedSeconds)
  }, [won, difficulty, elapsedSeconds])

  async function handleSave() {
    setSaveState('saving')
    try {
      await saveScore({
        playerName: profile.name || 'Jogador',
        grade: profile.grade,
        className: profile.className,
        difficulty,
        timeSeconds: elapsedSeconds,
      })
      setSaveState('saved')
    } catch {
      setSaveState('error')
    }
  }

  return (
    <div
      className={`w-full max-w-sm rounded-3xl border-4 p-6 text-center shadow-2xl ${
        won
          ? 'animate-pop-in border-accent bg-panel'
          : 'animate-shake border-danger/60 bg-panel'
      }`}
    >
      {won && <Confetti />}

      <p className="font-display text-4xl font-extrabold text-ink">
        {won ? 'Você venceu! 🎉' : 'Você perdeu 💥'}
      </p>

      {won && isRecord && (
        <p className="mt-1 font-display font-bold text-accent">
          ⭐ Novo recorde seu nesse nível!
        </p>
      )}

      <div className="mt-4 flex justify-center gap-3">
        <span className="rounded-xl bg-bg-deep px-4 py-2 font-display text-xl font-extrabold text-accent tabular-nums">
          {formatTime(elapsedSeconds)}
        </span>
        <span className="rounded-xl bg-bg-deep px-4 py-2 font-display text-xl font-bold text-ink">
          {DIFFICULTY_LABELS[difficulty] ?? difficulty}
        </span>
      </div>

      {won && (
        <div className="mt-5">
          {saveState === 'saved' ? (
            <p className="rounded-xl bg-success/15 px-4 py-3 font-body text-sm font-bold text-success">
              Salvo no ranking! ✅
            </p>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={saveState === 'saving'}
              className="w-full rounded-full bg-accent px-6 py-3 font-display text-lg font-extrabold text-ink-dark shadow-lg transition active:scale-95 disabled:opacity-60"
            >
              {saveState === 'saving'
                ? 'Salvando…'
                : `🏆 Salvar como ${profile.name || 'Jogador'}`}
            </button>
          )}
          {saveState === 'error' && (
            <p className="mt-2 font-body text-sm text-danger">
              Não foi possível salvar. Tente novamente.
            </p>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3">
        <button
          type="button"
          onClick={onPlayAgain}
          className="rounded-full border-2 border-panel-line bg-panel-soft px-6 py-3 font-display font-bold text-ink transition active:scale-95"
        >
          🔄 Jogar de novo
        </button>
        <div className="flex gap-3">
          <Link
            to="/ranking"
            className="flex-1 rounded-full border-2 border-panel-line px-4 py-3 font-display font-bold text-ink transition active:scale-95"
          >
            🏆 Ranking
          </Link>
          <Link
            to="/"
            className="flex-1 rounded-full border-2 border-panel-line px-4 py-3 font-display font-bold text-ink transition active:scale-95"
          >
            🏠 Menu
          </Link>
        </div>
      </div>
    </div>
  )
}

export default GameOverPanel
