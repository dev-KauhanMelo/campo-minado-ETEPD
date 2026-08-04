const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.detail ?? `Erro ${response.status}`)
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

export function getGame(gameId) {
  return request(`/game/${gameId}`)
}
