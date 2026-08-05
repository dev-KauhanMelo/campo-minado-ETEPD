import { useRef, useState } from 'react'

import { NUM_TEXT_CLASS } from '../lib/numberColors'

const LONG_PRESS_MS = 350
const MOVE_TOLERANCE_PX = 12

function Cell({ cell, row, col, checker, size, longPress, onActivate, onFlag, interactive }) {
  const isRevealed = cell.state === 'revealed'
  const isFlagged = cell.state === 'flagged'

  const timer = useRef(null)
  const origin = useRef(null)
  const fired = useRef(false)
  const [pressing, setPressing] = useState(false)

  function cancelPress() {
    clearTimeout(timer.current)
    timer.current = null
    origin.current = null
    setPressing(false)
  }

  function handlePointerDown(event) {
    if (!interactive || !longPress || isRevealed) return
    fired.current = false
    origin.current = { x: event.clientX, y: event.clientY }
    setPressing(true)
    timer.current = setTimeout(() => {
      fired.current = true
      setPressing(false)
      // Sem o "tec" no dedo, segurar vira adivinhação: foi ele que
      // faltava na primeira versão desse gesto.
      navigator.vibrate?.(35)
      onFlag(row, col)
    }, LONG_PRESS_MS)
  }

  function handlePointerMove(event) {
    if (!origin.current) return
    const dx = Math.abs(event.clientX - origin.current.x)
    const dy = Math.abs(event.clientY - origin.current.y)
    if (dx > MOVE_TOLERANCE_PX || dy > MOVE_TOLERANCE_PX) cancelPress()
  }

  function handleClick() {
    if (!interactive) return
    // O clique dispara logo depois do fim do toque longo: sem isso, a
    // casa acabaria de ser marcada e já seria cavada em seguida.
    if (fired.current) {
      fired.current = false
      return
    }
    cancelPress()
    onActivate(row, col)
  }

  function handleContextMenu(event) {
    event.preventDefault()
    if (interactive) onFlag(row, col)
  }

  let bg = checker ? 'bg-cell-closed-a' : 'bg-cell-closed-b'
  if (isRevealed) {
    bg = cell.is_mine ? 'bg-mine-bg-hit' : checker ? 'bg-cell-open-a' : 'bg-cell-open-b'
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={cancelPress}
      onPointerLeave={cancelPress}
      onPointerCancel={cancelPress}
      aria-label={`Linha ${row + 1}, coluna ${col + 1}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.56),
        borderRadius: Math.max(4, Math.round(size * 0.16)),
      }}
      className={`no-touch-callout flex shrink-0 items-center justify-center font-extrabold leading-none ${bg} ${
        pressing
          ? 'scale-75 ring-4 ring-flag transition-transform duration-300 ease-linear'
          : 'transition active:scale-90'
      }`}
    >
      {isFlagged && <span>🚩</span>}
      {isRevealed && cell.is_mine && <span>💣</span>}
      {isRevealed && !cell.is_mine && cell.adjacent_mines > 0 && (
        <span className={NUM_TEXT_CLASS[cell.adjacent_mines]}>{cell.adjacent_mines}</span>
      )}
    </button>
  )
}

export default Cell
