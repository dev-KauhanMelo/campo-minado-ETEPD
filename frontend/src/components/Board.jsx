import { useCallback, useEffect, useState } from 'react'

import { CELL_GAP, useCellSize, useIsTouch } from '../hooks/useBoardMetrics'
import Cell from './Cell'
import CellActionMenu from './CellActionMenu'

function Board({ cells, onReveal, onToggleFlag, interactive }) {
  const rows = cells.length
  const cols = cells[0]?.length ?? 0
  const cellSize = useCellSize(rows, cols)
  const isTouch = useIsTouch()
  const [menu, setMenu] = useState(null)

  const closeMenu = useCallback(() => setMenu(null), [])

  // Um menu aberto sobre um tabuleiro que mudou (ou acabou o jogo)
  // apontaria para o estado errado.
  useEffect(() => {
    if (!interactive) setMenu(null)
  }, [interactive])

  const handleActivate = useCallback(
    (row, col, rect) => {
      const cell = cells[row][col]
      if (cell.state === 'revealed') return

      if (!isTouch) {
        onReveal(row, col)
        return
      }

      setMenu((current) =>
        current && current.row === row && current.col === col
          ? null
          : { row, col, anchor: rect, flagged: cell.state === 'flagged' },
      )
    },
    [cells, isTouch, onReveal],
  )

  return (
    <div className="w-fit max-w-full overflow-x-auto rounded-2xl border-4 border-panel-line/60 bg-panel-soft p-2 shadow-xl">
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
              selected={menu?.row === row && menu?.col === col}
              onActivate={handleActivate}
              onFlag={onToggleFlag}
              interactive={interactive}
            />
          )),
        )}
      </div>

      {menu && (
        <CellActionMenu
          anchor={menu.anchor}
          flagged={menu.flagged}
          onClose={closeMenu}
          onDig={() => {
            closeMenu()
            onReveal(menu.row, menu.col)
          }}
          onFlag={() => {
            closeMenu()
            onToggleFlag(menu.row, menu.col)
          }}
        />
      )}
    </div>
  )
}

export default Board
