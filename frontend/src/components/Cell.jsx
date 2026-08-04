import { useRef } from 'react'

import { NUM_TEXT_CLASS } from '../lib/numberColors'

const LONG_PRESS_MS = 450

function Cell({ cell, row, col, checker, onReveal, onToggleFlag, interactive }) {
  const pressTimer = useRef(null)
  const longPressFired = useRef(false)

  function clearTimer() {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }

  function handleTouchStart() {
    if (!interactive) return
    longPressFired.current = false
    pressTimer.current = setTimeout(() => {
      longPressFired.current = true
      onToggleFlag(row, col)
    }, LONG_PRESS_MS)
  }

  function handleClick() {
    if (!interactive) return
    if (longPressFired.current) {
      longPressFired.current = false
      return
    }
    onReveal(row, col)
  }

  function handleContextMenu(event) {
    event.preventDefault()
    if (interactive) onToggleFlag(row, col)
  }

  const isRevealed = cell.state === 'revealed'
  const isFlagged = cell.state === 'flagged'

  let bg = checker ? 'bg-cell-closed-a' : 'bg-cell-closed-b'
  if (isRevealed) {
    bg = cell.is_mine ? 'bg-mine-bg-hit' : checker ? 'bg-cell-open-a' : 'bg-cell-open-b'
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={clearTimer}
      onTouchCancel={clearTimer}
      className={`flex size-8 shrink-0 items-center justify-center rounded-[4px] text-sm font-extrabold transition active:scale-90 ${bg}`}
    >
      {isFlagged && <span className="text-flag">⚑</span>}
      {isRevealed && cell.is_mine && '💣'}
      {isRevealed && !cell.is_mine && cell.adjacent_mines > 0 && (
        <span className={NUM_TEXT_CLASS[cell.adjacent_mines]}>
          {cell.adjacent_mines}
        </span>
      )}
    </button>
  )
}

export default Cell
