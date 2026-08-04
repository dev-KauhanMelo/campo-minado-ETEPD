import { useEffect, useState } from 'react'

export const CELL_GAP = 3

const MIN_CELL = 26
const MAX_CELL = 56
// Espaço reservado para HUD, botões e créditos, para o tabuleiro não
// nascer maior que a tela na vertical.
const RESERVED_HEIGHT = 240
const RESERVED_WIDTH = 48

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function computeCellSize(rows, cols) {
  if (!rows || !cols) return MIN_CELL
  const availableWidth = window.innerWidth - RESERVED_WIDTH
  const availableHeight = window.innerHeight - RESERVED_HEIGHT
  const byWidth = (availableWidth - (cols - 1) * CELL_GAP) / cols
  const byHeight = (availableHeight - (rows - 1) * CELL_GAP) / rows
  return clamp(Math.floor(Math.min(byWidth, byHeight)), MIN_CELL, MAX_CELL)
}

/**
 * Tamanho da célula em px. Tabuleiros pequenos (Fácil) crescem para
 * ocupar a tela em vez de ficarem minúsculos no desktop; os grandes
 * encolhem até o mínimo tocável e daí o tabuleiro rola na horizontal.
 */
export function useCellSize(rows, cols) {
  const [size, setSize] = useState(() => computeCellSize(rows, cols))

  useEffect(() => {
    function update() {
      setSize(computeCellSize(rows, cols))
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [rows, cols])

  return size
}

/** true em aparelhos de toque, onde o clique abre o menu Cavar/Bandeira. */
export function useIsTouch() {
  const [isTouch, setIsTouch] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches,
  )

  useEffect(() => {
    const query = window.matchMedia('(pointer: coarse)')
    const update = (event) => setIsTouch(event.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return isTouch
}
