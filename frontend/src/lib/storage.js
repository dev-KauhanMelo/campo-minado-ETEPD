// Tudo que o jogador não deveria precisar digitar de novo fica no
// localStorage do próprio aparelho: nome/turma, o jogo em andamento (para
// sobreviver a um F5 ou à aba fechada sem querer) e os recordes pessoais.
const PROFILE_KEY = 'campo-minado:perfil'
const CURRENT_GAME_KEY = 'campo-minado:jogo-atual'
const BESTS_KEY = 'campo-minado:recordes'
const CONTROLS_KEY = 'campo-minado:controles'

/** 'botoes' = barra Cavar/Bandeira; 'rapido' = toque cava, segurar marca. */
export const CONTROL_SCHEMES = ['botoes', 'rapido']

function read(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    // Modo privado ou storage bloqueado: o jogo segue funcionando sem
    // memória, então falhar aqui não pode quebrar a tela.
    return null
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* sem persistência: segue o jogo */
  }
}

function remove(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* idem */
  }
}

export function loadProfile() {
  const profile = read(PROFILE_KEY)
  return {
    name: profile?.name ?? '',
    grade: profile?.grade ?? '',
    className: profile?.className ?? '',
  }
}

export function saveProfile(profile) {
  write(PROFILE_KEY, {
    name: profile.name ?? '',
    grade: profile.grade ?? '',
    className: profile.className ?? '',
  })
}

export function loadCurrentGame() {
  const game = read(CURRENT_GAME_KEY)
  return game?.gameId ? game : null
}

export function saveCurrentGame({ gameId, difficulty }) {
  write(CURRENT_GAME_KEY, { gameId, difficulty, savedAt: Date.now() })
}

export function clearCurrentGame() {
  remove(CURRENT_GAME_KEY)
}

export function loadControlScheme() {
  const saved = read(CONTROLS_KEY)
  return CONTROL_SCHEMES.includes(saved) ? saved : 'botoes'
}

/** false enquanto o jogador nunca escolheu — é o gatilho das boas-vindas. */
export function isControlSchemeChosen() {
  return CONTROL_SCHEMES.includes(read(CONTROLS_KEY))
}

export function saveControlScheme(scheme) {
  write(CONTROLS_KEY, scheme)
}

export function loadBests() {
  return read(BESTS_KEY) ?? {}
}

/** Guarda o tempo se for o melhor do aparelho. Retorna true se for recorde. */
export function recordBest(difficulty, timeSeconds) {
  const bests = loadBests()
  const previous = bests[difficulty]
  if (previous != null && previous <= timeSeconds) return false
  write(BESTS_KEY, { ...bests, [difficulty]: timeSeconds })
  return true
}
