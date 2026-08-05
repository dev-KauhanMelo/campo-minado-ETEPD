import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import Credits from '../components/Credits'
import SettingsModal from '../components/SettingsModal'
import { useIsTouch } from '../hooks/useBoardMetrics'
import {
  isControlSchemeChosen,
  loadBests,
  loadControlScheme,
  loadCurrentGame,
  loadProfile,
  saveControlScheme,
} from '../lib/storage'

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
  const isTouch = useIsTouch()
  const [scheme, setScheme] = useState('botoes')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [firstTime, setFirstTime] = useState(false)

  useEffect(() => {
    setCurrent(loadCurrentGame())
    setBests(loadBests())
    setProfile(loadProfile())
    setScheme(loadControlScheme())
    // Só pergunta uma vez, e só onde a escolha importa (no toque).
    if (!isControlSchemeChosen() && isTouch) {
      setFirstTime(true)
      setSettingsOpen(true)
    }
  }, [isTouch])

  function changeScheme(next) {
    setScheme(next)
    saveControlScheme(next)
  }

  function closeSettings() {
    // Fechar sem tocar em nada também conta como escolha (fica no padrão),
    // senão as boas-vindas voltariam a aparecer na próxima visita.
    saveControlScheme(scheme)
    setSettingsOpen(false)
    setFirstTime(false)
  }

  const bestEntries = Object.entries(bests)

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between gap-8 px-5 py-8">
      {isTouch && (
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label="Configurações"
          className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full border-2 border-panel-line bg-panel text-xl shadow-lg transition active:scale-90"
        >
          ⚙️
        </button>
      )}

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

      {settingsOpen && (
        <SettingsModal
          scheme={scheme}
          firstTime={firstTime}
          onChangeScheme={changeScheme}
          onClose={closeSettings}
        />
      )}
    </main>
  )
}

export default HomePage
