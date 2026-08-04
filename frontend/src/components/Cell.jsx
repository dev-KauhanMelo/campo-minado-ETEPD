import { NUM_TEXT_CLASS } from '../lib/numberColors'

function Cell({ cell, row, col, checker, size, selected, onActivate, onFlag, interactive }) {
  const isRevealed = cell.state === 'revealed'
  const isFlagged = cell.state === 'flagged'

  function handleClick(event) {
    if (!interactive) return
    onActivate(row, col, event.currentTarget.getBoundingClientRect())
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
      aria-label={`Linha ${row + 1}, coluna ${col + 1}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.56),
        borderRadius: Math.max(4, Math.round(size * 0.16)),
      }}
      className={`no-touch-callout flex shrink-0 items-center justify-center font-extrabold leading-none transition active:scale-90 ${bg} ${
        selected ? 'ring-4 ring-accent' : ''
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
