const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch {
    throw new ApiError('Sem conexão com o servidor do jogo.', 0)
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new ApiError(body?.detail ?? `Erro ${response.status}`, response.status)
  }
  return response.json()
}

export function startGame(difficulty) {
  return request('/game/start', {
    method: 'POST',
    body: JSON.stringify({ difficulty }),
  })
}

export function revealCell(gameId, row, col) {
  return request('/game/reveal', {
    method: 'POST',
    body: JSON.stringify({ game_id: gameId, row, col }),
  })
}

export function toggleFlag(gameId, row, col) {
  return request('/game/flag', {
    method: 'POST',
    body: JSON.stringify({ game_id: gameId, row, col }),
  })
}

export function pauseGame(gameId) {
  return request('/game/pause', {
    method: 'POST',
    body: JSON.stringify({ game_id: gameId }),
  })
}

export function resumeGame(gameId) {
  return request('/game/resume', {
    method: 'POST',
    body: JSON.stringify({ game_id: gameId }),
  })
}

export function getGame(gameId) {
  return request(`/game/${gameId}`)
}
