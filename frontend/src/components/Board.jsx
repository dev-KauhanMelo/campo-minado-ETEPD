import Cell from './Cell'

function Board({ cells, onReveal, onToggleFlag, interactive }) {
  const cols = cells[0]?.length ?? 0

  return (
    <div className="w-fit max-w-full overflow-x-auto rounded-xl bg-surface p-2 shadow-inner">
      <div
        className="grid w-fit gap-[2px]"
        style={{ gridTemplateColumns: `repeat(${cols}, 2rem)` }}
      >
        {cells.map((rowCells, row) =>
          rowCells.map((cell, col) => (
            <Cell
              key={`${row}-${col}`}
              cell={cell}
              row={row}
              col={col}
              checker={(row + col) % 2 === 0}
              onReveal={onReveal}
              onToggleFlag={onToggleFlag}
              interactive={interactive}
            />
          )),
        )}
      </div>
    </div>
  )
}

export default Board
