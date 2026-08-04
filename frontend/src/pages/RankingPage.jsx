import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import Podium from '../components/Podium'
import { subscribeToRanking } from '../lib/ranking'

const DIFFICULTIES = [
  { id: 'facil', label: 'Fácil' },
  { id: 'medio', label: 'Médio' },
  { id: 'dificil', label: 'Difícil' },
]

const PAGE_SIZE = 10
const LOAD_TIMEOUT_MS = 10_000

function formatTime(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds ?? 0))
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

function RankingPage() {
  const [difficulty, setDifficulty] = useState('facil')
  const [count, setCount] = useState(PAGE_SIZE)
  const [scores, setScores] = useState(null) // null = ainda sem resposta
  const [error, setError] = useState(null)

  useEffect(() => {
    setScores(null)
    setError(null)
    let settled = false

    const timeoutId = setTimeout(() => {
      if (!settled) setError('Não foi possível carregar o ranking.')
    }, LOAD_TIMEOUT_MS)

    const unsubscribe = subscribeToRanking(
      difficulty,
      count,
      (data) => {
        settled = true
        clearTimeout(timeoutId)
        setScores(data)
        setError(null)
      },
      () => {
        settled = true
        clearTimeout(timeoutId)
        setError('Não foi possível carregar o ranking.')
      },
    )

    return () => {
      clearTimeout(timeoutId)
      unsubscribe()
    }
  }, [difficulty, count])

  const top3 = scores?.slice(0, 3) ?? []
  const rest = scores?.slice(3) ?? []
  const canLoadMore = scores !== null && scores.length === count

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 bg-bg px-4 py-8">
      <div className="w-full max-w-md">
        <Link to="/" className="font-body text-sm font-semibold text-accent">
          ← Voltar
        </Link>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-ink">Ranking</h1>

        <div className="mt-4 flex gap-2 rounded-full bg-surface p-1 shadow-inner">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => {
                setDifficulty(d.id)
                setCount(PAGE_SIZE)
              }}
              className={`flex-1 rounded-full px-3 py-2 font-display text-sm font-bold transition ${
                difficulty === d.id ? 'bg-accent text-white' : 'text-ink-soft'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {error && <p className="mt-6 font-body text-sm text-danger">{error}</p>}

        {!error && scores === null && (
          <p className="mt-6 font-body text-ink-soft">Carregando ranking…</p>
        )}

        {!error && scores !== null && scores.length === 0 && (
          <p className="mt-6 font-body text-ink-soft">
            Ninguém no ranking ainda. Seja o primeiro!
          </p>
        )}

        {!error && scores !== null && scores.length > 0 && (
          <>
            <Podium entries={top3} />

            {rest.length > 0 && (
              <ol className="mt-4 flex flex-col gap-2">
                {rest.map((entry, index) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between rounded-xl bg-surface px-4 py-3 shadow"
                  >
                    <span className="font-body font-bold text-ink-soft">
                      {index + 4}º
                    </span>
                    <span className="flex-1 truncate px-3 font-body font-semibold text-ink">
                      {entry.playerName}
                    </span>
                    <span className="font-body text-ink-soft">
                      {formatTime(entry.timeSeconds)}
                    </span>
                  </li>
                ))}
              </ol>
            )}

            {canLoadMore && (
              <button
                type="button"
                onClick={() => setCount((c) => c + PAGE_SIZE)}
                className="mt-4 w-full rounded-full border-2 border-accent px-6 py-3 font-display font-bold text-accent transition active:scale-95"
              >
                Carregar mais
              </button>
            )}
          </>
        )}
      </div>
    </main>
  )
}

export default RankingPage
