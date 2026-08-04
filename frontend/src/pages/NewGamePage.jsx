import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { startGame } from '../lib/api'

const DIFFICULTIES = [
  { id: 'facil', label: 'Fácil', dims: '9 × 9', mines: 10 },
  { id: 'medio', label: 'Médio', dims: '16 × 16', mines: 40 },
  { id: 'dificil', label: 'Difícil', dims: '16 × 30', mines: 99 },
]

function NewGamePage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [difficulty, setDifficulty] = useState('facil')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    const playerName = name.trim()
    if (!playerName) {
      setError('Digite um nome para jogar.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const game = await startGame(difficulty)
      navigate(`/jogo/${game.game_id}`, { state: { playerName, difficulty } })
    } catch {
      setError('Não foi possível iniciar o jogo. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-bg px-6 py-10">
      <div className="w-full max-w-sm">
        <Link to="/" className="font-body text-sm font-semibold text-accent">
          ← Voltar
        </Link>

        <h1 className="mt-4 font-display text-3xl font-extrabold text-ink">
          Novo Jogo
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
          <div>
            <label
              htmlFor="player-name"
              className="font-body text-sm font-bold text-ink"
            >
              Seu nome
            </label>
            <input
              id="player-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={24}
              placeholder="Como você quer aparecer no ranking"
              className="mt-2 w-full rounded-xl border-2 border-cell-open-b bg-surface px-4 py-3 font-body text-ink outline-none focus:border-accent"
            />
          </div>

          <div>
            <p className="font-body text-sm font-bold text-ink">Dificuldade</p>
            <div className="mt-2 flex flex-col gap-3">
              {DIFFICULTIES.map((option) => {
                const selected = difficulty === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setDifficulty(option.id)}
                    aria-pressed={selected}
                    className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition ${
                      selected
                        ? 'border-accent bg-accent-soft'
                        : 'border-cell-open-b bg-surface'
                    }`}
                  >
                    <span className="font-display font-bold text-ink">
                      {option.label}
                    </span>
                    <span className="font-body text-sm text-ink-soft">
                      {option.dims} · {option.mines} minas
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {error && (
            <p className="font-body text-sm font-semibold text-danger">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-accent px-8 py-4 font-display text-lg font-bold text-white shadow-lg transition active:scale-95 disabled:opacity-60"
          >
            {loading ? 'Preparando tabuleiro…' : 'Começar'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default NewGamePage
