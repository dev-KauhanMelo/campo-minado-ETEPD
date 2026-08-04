import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import Board from '../components/Board'
import GameOverPanel from '../components/GameOverPanel'
import { getGame, revealCell, toggleFlag } from '../lib/api'

function formatTime(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds ?? 0))
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

function GamePage() {
  const { gameId } = useParams()
  const location = useLocation()
  const playerName = location.state?.playerName ?? 'Jogador'

  const [game, setGame] = useState(null)
  const [error, setError] = useState(null)
  const [displayElapsed, setDisplayElapsed] = useState(0)
  const syncRef = useRef({ serverElapsed: 0, syncedAt: Date.now() })

  const applyGame = useCallback((data) => {
    setGame(data)
    syncRef.current = {
      serverElapsed: data.elapsed_seconds ?? 0,
      syncedAt: Date.now(),
    }
    setDisplayElapsed(data.elapsed_seconds ?? 0)
  }, [])

  useEffect(() => {
    let cancelled = false
    getGame(gameId)
      .then((data) => {
        if (!cancelled) applyGame(data)
      })
      .catch(() => {
        if (!cancelled) setError('Não foi possível carregar o jogo.')
      })
    return () => {
      cancelled = true
    }
  }, [gameId, applyGame])

  useEffect(() => {
    if (!game || game.status !== 'in_progress' || game.elapsed_seconds === null) {
      return undefined
    }
    const interval = setInterval(() => {
      const { serverElapsed, syncedAt } = syncRef.current
      setDisplayElapsed(serverElapsed + (Date.now() - syncedAt) / 1000)
    }, 1000)
    return () => clearInterval(interval)
  }, [game])

  const handleReveal = useCallback(
    async (row, col) => {
      try {
        const data = await revealCell(gameId, row, col)
        applyGame(data)
      } catch {
        setError('Não foi possível revelar a célula.')
      }
    },
    [gameId, applyGame],
  )

  const handleToggleFlag = useCallback(
    async (row, col) => {
      try {
        const data = await toggleFlag(gameId, row, col)
        applyGame(data)
      } catch {
        setError('Não foi possível marcar a bandeira.')
      }
    },
    [gameId, applyGame],
  )

  if (!game) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg">
        <p className="font-body text-ink-soft">{error ?? 'Carregando tabuleiro…'}</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-4 bg-bg px-4 py-6">
      <div className="flex w-full max-w-2xl items-center justify-between">
        <span className="font-body text-sm text-ink-soft">{playerName}</span>
        <div className="flex items-center gap-4 font-display font-bold text-ink">
          <span>🚩 {game.flags_remaining}</span>
          <span>⏱ {formatTime(displayElapsed)}</span>
        </div>
      </div>

      <Board
        cells={game.cells}
        onReveal={handleReveal}
        onToggleFlag={handleToggleFlag}
        interactive={game.status === 'in_progress'}
      />

      {game.status !== 'in_progress' && (
        <GameOverPanel
          status={game.status}
          difficulty={game.difficulty}
          elapsedSeconds={game.elapsed_seconds}
        />
      )}

      {error && <p className="font-body text-sm text-danger">{error}</p>}
    </main>
  )
}

export default GamePage
