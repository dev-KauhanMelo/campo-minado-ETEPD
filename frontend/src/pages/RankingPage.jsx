import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import Credits from '../components/Credits'
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

function describeClass(entry) {
  return [entry?.grade, entry?.className].filter(Boolean).join(' ')
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
    <main className="flex min-h-screen flex-col items-center px-4 py-8">
      <div className="w-full max-w-md flex-1">
        <Link to="/" className="font-body text-sm font-bold text-accent">
          ← Voltar
        </Link>
        <h1 className="mt-2 font-display text-4xl font-extrabold text-ink">
          🏆 Ranking
        </h1>

        <div className="mt-4 flex gap-1 rounded-full border-2 border-panel-line/60 bg-panel/80 p-1">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => {
                setDifficulty(d.id)
                setCount(PAGE_SIZE)
              }}
              className={`flex-1 rounded-full px-3 py-2 font-display text-sm font-bold transition ${
                difficulty === d.id
                  ? 'bg-accent text-ink-dark shadow'
                  : 'text-ink-soft'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-6 rounded-xl bg-danger/15 px-4 py-3 font-body text-sm text-danger">
            {error}
          </p>
        )}

        {!error && scores === null && (
          <p className="mt-6 font-body text-ink-soft">Carregando ranking…</p>
        )}

        {!error && scores !== null && scores.length === 0 && (
          <div className="mt-8 rounded-2xl border-2 border-dashed border-panel-line/70 p-8 text-center">
            <p className="font-display text-xl font-bold text-ink">
              Ninguém aqui ainda
            </p>
            <p className="mt-1 font-body text-sm text-ink-soft">
              Vença uma partida e seja o primeiro do ranking!
            </p>
            <Link
              to="/novo-jogo"
              className="mt-4 inline-block rounded-full bg-accent px-6 py-3 font-display font-extrabold text-ink-dark transition active:scale-95"
            >
              ⛏️ Jogar agora
            </Link>
          </div>
        )}

        {!error && scores !== null && scores.length > 0 && (
          <>
            <Podium entries={top3} />

            {rest.length > 0 && (
              <ol className="mt-4 flex flex-col gap-2">
                {rest.map((entry, index) => {
                  const turma = describeClass(entry)
                  return (
                    <li
                      key={entry.id}
                      className="flex items-center gap-3 rounded-2xl border-2 border-panel-line/50 bg-panel/80 px-4 py-3"
                    >
                      <span className="font-display font-extrabold text-accent">
                        {index + 4}º
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-body font-bold text-ink">
                          {entry.playerName}
                        </span>
                        {turma && (
                          <span className="block truncate font-body text-xs text-ink-soft">
                            {turma}
                          </span>
                        )}
                      </span>
                      <span className="font-display font-bold text-ink tabular-nums">
                        {formatTime(entry.timeSeconds)}
                      </span>
                    </li>
                  )
                })}
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

      <Credits className="mt-8" />
    </main>
  )
}

export default RankingPage
