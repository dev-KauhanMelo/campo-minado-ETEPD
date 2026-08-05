import { useCallback } from 'react'

import { CELL_GAP, useCellSize, useIsTouch } from '../hooks/useBoardMetrics'
import Cell from './Cell'

function Board({ cells, onReveal, onToggleFlag, interactive, touchMode, scheme }) {
  const rows = cells.length
  const cols = cells[0]?.length ?? 0
  const cellSize = useCellSize(rows, cols)
  const isTouch = useIsTouch()
  const porBotoes = isTouch && scheme === 'botoes'

  const handleActivate = useCallback(
    (row, col) => {
      if (cells[row][col].state === 'revealed') return
      // Com a barra de modo, quem manda é o botão escolhido; no esquema
      // rápido (e no mouse) o toque sempre cava.
      if (porBotoes && touchMode === 'flag') onToggleFlag(row, col)
      else onReveal(row, col)
    },
    [cells, porBotoes, touchMode, onReveal, onToggleFlag],
  )

  const flagging = porBotoes && touchMode === 'flag'

  return (
    <div
      className={`w-fit max-w-full overflow-x-auto rounded-2xl border-4 bg-panel-soft p-2 shadow-xl transition-colors ${
        flagging ? 'border-flag' : 'border-panel-line/60'
      }`}
    >
      <div
        className="grid w-fit"
        style={{
          gap: CELL_GAP,
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        }}
      >
        {cells.map((rowCells, row) =>
          rowCells.map((cell, col) => (
            <Cell
              key={`${row}-${col}`}
              cell={cell}
              row={row}
              col={col}
              size={cellSize}
              checker={(row + col) % 2 === 0}
              longPress={isTouch && scheme === 'rapido'}
              onActivate={handleActivate}
              onFlag={onToggleFlag}
              interactive={interactive}
            />
          )),
        )}
      </div>
    </div>
  )
}

export default Board
