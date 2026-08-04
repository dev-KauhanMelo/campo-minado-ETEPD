import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import Credits from '../components/Credits'
import { loadBests, loadCurrentGame, loadProfile } from '../lib/storage'

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

function HomePage() {
  const [current, setCurrent] = useState(null)
  const [bests, setBests] = useState({})
  const [profile, setProfile] = useState({ name: '' })

  useEffect(() => {
    setCurrent(loadCurrentGame())
    setBests(loadBests())
    setProfile(loadProfile())
  }, [])

  const bestEntries = Object.entries(bests)

  return (
    <main className="flex min-h-screen flex-col items-center justify-between gap-8 px-5 py-8">
      <div className="flex w-full max-w-md flex-1 flex-col items-center justify-center gap-8">
        <div className="flex animate-rise flex-col items-center gap-2 text-center sm:flex-row sm:gap-4 sm:text-left">
          <img
            src="/kauhan.png"
            alt=""
            width="221"
            height="420"
            className="h-32 w-auto animate-float drop-shadow-2xl sm:h-44"
          />
          <div>
            <p className="font-body text-xs font-extrabold uppercase tracking-[0.2em] text-accent">
              ETE Porto Digital
            </p>
            <h1 className="mt-1 font-display text-5xl font-extrabold leading-none text-ink drop-shadow-lg">
              Campo
              <br />
              Minado
            </h1>
            <p className="mt-3 font-body text-sm text-ink-soft">
              {profile.name
                ? `Bora, ${profile.name}! Cave, marque as minas e entre no ranking.`
                : 'Cave, marque as minas e entre no ranking da escola.'}
            </p>
          </div>
        </div>

        <div className="flex w-full max-w-xs animate-rise flex-col gap-3">
          {current && (
            <Link
              to={`/jogo/${current.gameId}`}
              className="rounded-2xl border-2 border-accent bg-accent/15 px-6 py-3 text-center font-display font-bold text-accent transition active:scale-95"
            >
              ↩ Continuar jogo
              <span className="ml-1 font-body text-xs font-semibold text-ink-soft">
                ({DIFFICULTY_LABELS[current.difficulty] ?? current.difficulty})
              </span>
            </Link>
          )}

          <Link
            to="/novo-jogo"
            className="rounded-full bg-accent px-8 py-4 text-center font-display text-xl font-extrabold text-ink-dark shadow-xl transition active:scale-95"
          >
            ⛏️ Novo Jogo
          </Link>
          <Link
            to="/ranking"
            className="rounded-full border-2 border-panel-line bg-panel px-8 py-4 text-center font-display text-lg font-bold text-ink shadow-lg transition active:scale-95"
          >
            🏆 Ver Ranking
          </Link>
        </div>

        {bestEntries.length > 0 && (
          <div className="w-full max-w-xs rounded-2xl border-2 border-panel-line/60 bg-panel/70 p-4">
            <p className="font-display text-sm font-bold text-accent">
              Seus melhores tempos
            </p>
            <ul className="mt-2 flex flex-col gap-1">
              {bestEntries.map(([difficulty, seconds]) => (
                <li
                  key={difficulty}
                  className="flex justify-between font-body text-sm text-ink-soft"
                >
                  <span>{DIFFICULTY_LABELS[difficulty] ?? difficulty}</span>
                  <span className="font-bold text-ink">{formatTime(seconds)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <Credits />
    </main>
  )
}

export default HomePage
