import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import Board from '../components/Board'
import Credits from '../components/Credits'
import GameOverPanel from '../components/GameOverPanel'
import PauseMenu from '../components/PauseMenu'
import { getGame, pauseGame, resumeGame, revealCell, startGame, toggleFlag } from '../lib/api'
import {
  clearCurrentGame,
  loadProfile,
  saveCurrentGame,
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

function GamePage() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const [profile] = useState(() => loadProfile())

  const [game, setGame] = useState(null)
  const [error, setError] = useState(null)
  const [lost, setLost] = useState(false) // sessão sumiu no servidor
  const [menuOpen, setMenuOpen] = useState(false)
  const [restarting, setRestarting] = useState(false)
  const [displayElapsed, setDisplayElapsed] = useState(0)
  const syncRef = useRef({ serverElapsed: 0, syncedAt: Date.now() })

  const applyGame = useCallback((data) => {
    setGame(data)
    setError(null)
    syncRef.current = {
      serverElapsed: data.elapsed_seconds ?? 0,
      syncedAt: Date.now(),
    }
    setDisplayElapsed(data.elapsed_seconds ?? 0)
  }, [])

  const handleApiError = useCallback((err, fallback) => {
    // 404 = o backend reiniciou (o plano grátis hiberna) e perdeu a
    // partida da memória. Insistir nessa tela não leva a nada.
    if (err?.status === 404) {
      clearCurrentGame()
      setLost(true)
      return
    }
    setError(fallback)
  }, [])

  useEffect(() => {
    let cancelled = false
    getGame(gameId)
      .then((data) => {
        if (cancelled) return
        applyGame(data)
        if (data.status === 'in_progress') {
          saveCurrentGame({ gameId, difficulty: data.difficulty })
          // Quem saiu para o menu deixou o jogo pausado: volta mostrando
          // a pausa em vez de já retomar o cronômetro sem avisar.
          if (data.paused) setMenuOpen(true)
        } else {
          clearCurrentGame()
        }
      })
      .catch((err) => {
        if (!cancelled) handleApiError(err, 'Não foi possível carregar o jogo.')
      })
    return () => {
      cancelled = true
    }
  }, [gameId, applyGame, handleApiError])

  useEffect(() => {
    if (!game || game.status !== 'in_progress' || game.paused) return undefined
    if (game.elapsed_seconds === null) return undefined

    const interval = setInterval(() => {
      const { serverElapsed, syncedAt } = syncRef.current
      setDisplayElapsed(serverElapsed + (Date.now() - syncedAt) / 1000)
    }, 1000)
    return () => clearInterval(interval)
  }, [game])

  // Se o servidor ainda achar que o jogo está pausado (um "resume" que se
  // perdeu na rede), a jogada volta 409: retoma e repete uma vez, em vez
  // de exigir que o jogador descubra sozinho o que houve.
  const comRetomada = useCallback(
    async (jogada) => {
      try {
        return await jogada()
      } catch (err) {
        if (err?.status !== 409) throw err
        await resumeGame(gameId)
        return jogada()
      }
    },
    [gameId],
  )

  const handleReveal = useCallback(
    async (row, col) => {
      try {
        const data = await comRetomada(() => revealCell(gameId, row, col))
        applyGame(data)
        if (data.status !== 'in_progress') clearCurrentGame()
      } catch (err) {
        handleApiError(err, 'Não foi possível cavar aqui.')
      }
    },
    [gameId, applyGame, handleApiError, comRetomada],
  )

  const handleToggleFlag = useCallback(
    async (row, col) => {
      try {
        applyGame(await comRetomada(() => toggleFlag(gameId, row, col)))
      } catch (err) {
        handleApiError(err, 'Não foi possível marcar a bandeira.')
      }
    },
    [gameId, applyGame, handleApiError, comRetomada],
  )

  async function openMenu() {
    setMenuOpen(true)
    try {
      applyGame(await pauseGame(gameId))
    } catch {
      /* sem pausa no servidor o tempo segue correndo — nunca a favor
         do jogador, então não vale bloquear o menu por isso */
    }
  }

  async function closeMenu() {
    setMenuOpen(false)
    try {
      applyGame(await resumeGame(gameId))
    } catch {
      /* se o resume não chegar, a primeira jogada retoma o jogo (409) */
    }
  }

  async function handleRestart() {
    setRestarting(true)
    try {
      const fresh = await startGame(game.difficulty)
      saveCurrentGame({ gameId: fresh.game_id, difficulty: game.difficulty })
      setMenuOpen(false)
      navigate(`/jogo/${fresh.game_id}`, { replace: true })
    } catch {
      setError('Não foi possível recomeçar.')
    } finally {
      setRestarting(false)
    }
  }

  if (lost) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center">
        <p className="font-display text-3xl font-extrabold text-ink">
          Essa partida expirou 😴
        </p>
        <p className="max-w-xs font-body text-ink-soft">
          O servidor hiberna quando fica sem uso e acabou esquecendo esse
          tabuleiro. Bora começar outro?
        </p>
        <Link
          to="/novo-jogo"
          className="rounded-full bg-accent px-8 py-4 font-display text-lg font-extrabold text-ink-dark shadow-xl transition active:scale-95"
        >
          Novo jogo
        </Link>
        <Link to="/" className="font-body text-sm font-bold text-accent">
          ← Voltar ao menu
        </Link>
      </main>
    )
  }

  if (!game) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <p className="text-center font-body text-ink-soft">
          {error ?? 'Carregando tabuleiro…'}
        </p>
      </main>
    )
  }

  const finished = game.status !== 'in_progress'

  return (
    <main className="flex min-h-screen flex-col items-center gap-4 px-4 py-5">
      <div className="mx-auto my-auto flex w-fit max-w-full flex-col gap-3">
        <div className="flex min-w-68 items-center justify-between gap-3 rounded-2xl border-2 border-panel-line/60 bg-panel/80 px-3 py-2">
          <button
            type="button"
            onClick={openMenu}
            disabled={finished}
            aria-label="Abrir menu de pausa"
            className="flex size-10 items-center justify-center rounded-xl bg-panel-soft font-display text-lg text-ink transition active:scale-90 disabled:opacity-40"
          >
            ☰
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate font-display font-bold leading-tight text-ink">
              {profile.name || 'Jogador'}
            </p>
            <p className="truncate font-body text-xs text-ink-soft">
              {[profile.grade, profile.className].filter(Boolean).join(' ') ||
                DIFFICULTY_LABELS[game.difficulty]}
            </p>
          </div>

          <div className="flex items-center gap-3 font-display text-lg font-extrabold">
            <span className="flex items-center gap-1 text-ink">
              🚩 {game.flags_remaining}
            </span>
            <span className="flex items-center gap-1 rounded-lg bg-bg-deep px-2 py-1 text-accent tabular-nums">
              {formatTime(displayElapsed)}
            </span>
          </div>
        </div>

        <Board
          cells={game.cells}
          onReveal={handleReveal}
          onToggleFlag={handleToggleFlag}
          interactive={!finished && !game.paused && !menuOpen}
        />

        <p className="text-center font-body text-xs text-ink-soft">
          <span className="hidden sm:inline">
            Clique para cavar · clique direito marca bandeira
          </span>
          <span className="sm:hidden">Toque numa casa e escolha cavar ou marcar</span>
        </p>
      </div>

      {finished && (
        <GameOverPanel
          status={game.status}
          difficulty={game.difficulty}
          elapsedSeconds={game.elapsed_seconds}
          profile={profile}
          onPlayAgain={handleRestart}
        />
      )}

      {error && (
        <p className="rounded-xl bg-danger/15 px-4 py-2 font-body text-sm text-danger">
          {error}
        </p>
      )}

      {menuOpen && (
        <PauseMenu
          restarting={restarting}
          onResume={closeMenu}
          onRestart={handleRestart}
          onExit={() => navigate('/')}
        />
      )}

      <Credits className="pt-2" />
    </main>
  )
}

export default GamePage
