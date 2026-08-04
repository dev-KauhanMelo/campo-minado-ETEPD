const PODIUM_ORDER = [2, 1, 3] // exibição: 2º à esquerda, 1º ao centro, 3º à direita

const PODIUM_STYLES = {
  1: { height: 'h-32', bg: 'bg-gold', label: '1º' },
  2: { height: 'h-24', bg: 'bg-silver', label: '2º' },
  3: { height: 'h-20', bg: 'bg-bronze', label: '3º' },
}

function formatTime(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds ?? 0))
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

function Podium({ entries }) {
  const byPosition = { 1: entries[0], 2: entries[1], 3: entries[2] }

  return (
    <div className="mt-4 flex items-end justify-center gap-2">
      {PODIUM_ORDER.map((position) => {
        const entry = byPosition[position]
        const style = PODIUM_STYLES[position]
        return (
          <div key={position} className="flex w-24 flex-col items-center gap-1">
            <span className="w-full truncate text-center font-body text-sm font-bold text-ink">
              {entry ? entry.playerName : '—'}
            </span>
            <span className="font-body text-xs text-ink-soft">
              {entry ? formatTime(entry.timeSeconds) : ''}
            </span>
            <div
              className={`flex w-full ${style.height} items-start justify-center rounded-t-xl ${style.bg} pt-2 font-display text-lg font-extrabold text-ink`}
            >
              {style.label}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Podium
