import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import Credits from '../components/Credits'
import { startGame } from '../lib/api'
import { loadProfile, saveCurrentGame, saveProfile } from '../lib/storage'

const DIFFICULTIES = [
  { id: 'facil', label: 'Fácil', dims: '9 × 9', mines: 10, emoji: '🌱', accent: 'bg-success' },
  { id: 'medio', label: 'Médio', dims: '16 × 16', mines: 40, emoji: '🔥', accent: 'bg-tangerine' },
  { id: 'dificil', label: 'Difícil', dims: '16 × 30', mines: 99, emoji: '💀', accent: 'bg-flag' },
]

const GRADES = ['1º', '2º', '3º']

// O backend roda no plano grátis do Render, que hiberna quando ninguém
// joga há um tempo: a primeira partida do dia pode demorar a responder.
const SLOW_START_MS = 4000

function NewGamePage() {
  const navigate = useNavigate()
  const saved = loadProfile()
  const [name, setName] = useState(saved.name)
  const [grade, setGrade] = useState(saved.grade)
  const [className, setClassName] = useState(saved.className)
  const [difficulty, setDifficulty] = useState('facil')
  const [loading, setLoading] = useState(false)
  const [slow, setSlow] = useState(false)
  const [error, setError] = useState(null)
  const slowTimer = useRef(null)

  useEffect(() => () => clearTimeout(slowTimer.current), [])

  async function handleSubmit(event) {
    event.preventDefault()
    const playerName = name.trim()
    if (!playerName) {
      setError('Digite um nome para jogar.')
      return
    }

    saveProfile({ name: playerName, grade, className: className.trim() })
    setLoading(true)
    setError(null)
    slowTimer.current = setTimeout(() => setSlow(true), SLOW_START_MS)

    try {
      const game = await startGame(difficulty)
      saveCurrentGame({ gameId: game.game_id, difficulty })
      navigate(`/jogo/${game.game_id}`)
    } catch {
      setError('Não foi possível iniciar o jogo. Tente novamente.')
      setLoading(false)
    } finally {
      clearTimeout(slowTimer.current)
      setSlow(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center px-5 py-8">
      <div className="w-full max-w-sm flex-1">
        <Link to="/" className="font-body text-sm font-bold text-accent">
          ← Voltar
        </Link>

        <h1 className="mt-3 font-display text-4xl font-extrabold text-ink">Novo Jogo</h1>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
          <div className="rounded-2xl border-2 border-panel-line/60 bg-panel/70 p-4">
            <label htmlFor="player-name" className="font-display text-sm font-bold text-accent">
              Seu nome
            </label>
            <input
              id="player-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={24}
              placeholder="Como você aparece no ranking"
              className="mt-2 w-full rounded-xl border-2 border-panel-line bg-bg-deep px-4 py-3 font-body text-ink outline-none placeholder:text-ink-soft/60 focus:border-accent"
            />

            <p className="mt-4 font-display text-sm font-bold text-accent">
              Série e turma <span className="font-body text-xs text-ink-soft">(opcional)</span>
            </p>
            <div className="mt-2 flex gap-2">
              {GRADES.map((option) => {
                const selected = grade === option
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setGrade(selected ? '' : option)}
                    aria-pressed={selected}
                    className={`flex-1 rounded-xl border-2 py-2 font-display font-bold transition ${
                      selected
                        ? 'border-accent bg-accent text-ink-dark'
                        : 'border-panel-line bg-bg-deep text-ink-soft'
                    }`}
                  >
                    {option}
                  </button>
                )
              })}
              <input
                type="text"
                value={className}
                onChange={(event) => setClassName(event.target.value)}
                maxLength={16}
                placeholder="Turma"
                aria-label="Turma"
                className="w-24 rounded-xl border-2 border-panel-line bg-bg-deep px-3 py-2 text-center font-body text-ink outline-none placeholder:text-ink-soft/60 focus:border-accent"
              />
            </div>
          </div>

          <div>
            <p className="font-display text-sm font-bold text-accent">Dificuldade</p>
            <div className="mt-2 flex flex-col gap-3">
              {DIFFICULTIES.map((option) => {
                const selected = difficulty === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setDifficulty(option.id)}
                    aria-pressed={selected}
                    className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition ${
                      selected
                        ? 'border-accent bg-accent/15 shadow-lg'
                        : 'border-panel-line/60 bg-panel/70'
                    }`}
                  >
                    <span
                      className={`flex size-10 items-center justify-center rounded-xl text-xl ${option.accent}`}
                    >
                      {option.emoji}
                    </span>
                    <span className="flex-1">
                      <span className="block font-display font-bold text-ink">
                        {option.label}
                      </span>
                      <span className="block font-body text-xs text-ink-soft">
                        {option.dims} · {option.mines} minas
                      </span>
                    </span>
                    {selected && <span className="font-display text-accent">✓</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-danger/15 px-4 py-3 font-body text-sm font-semibold text-danger">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-accent px-8 py-4 font-display text-xl font-extrabold text-ink-dark shadow-xl transition active:scale-95 disabled:opacity-60"
          >
            {loading ? 'Preparando tabuleiro…' : 'Começar'}
          </button>

          {slow && (
            <p className="text-center font-body text-xs text-ink-soft">
              O servidor estava dormindo e está acordando — isso pode levar até um
              minuto na primeira partida. 💤
            </p>
          )}
        </form>
      </div>

      <Credits className="mt-8" />
    </main>
  )
}

export default NewGamePage
