const PODIUM_ORDER = [2, 1, 3] // exibição: 2º à esquerda, 1º ao centro, 3º à direita

const PODIUM_STYLES = {
  1: { height: 'h-32', bg: 'bg-gold', ring: 'border-gold', badge: '👑', label: '1º' },
  2: { height: 'h-24', bg: 'bg-silver', ring: 'border-silver', badge: '2', label: '2º' },
  3: { height: 'h-20', bg: 'bg-bronze', ring: 'border-bronze', badge: '3', label: '3º' },
}

function formatTime(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds ?? 0))
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

function describeClass(entry) {
  return [entry?.grade, entry?.className].filter(Boolean).join(' ')
}

function Podium({ entries }) {
  const byPosition = { 1: entries[0], 2: entries[1], 3: entries[2] }
  // Com menos de três colocados, degraus vazios ficavam soltos na tela —
  // melhor mostrar só quem existe.
  const visible = PODIUM_ORDER.filter((position) => byPosition[position])

  return (
    <div className="mt-5 flex items-end justify-center gap-2">
      {visible.map((position) => {
        const entry = byPosition[position]
        const style = PODIUM_STYLES[position]
        const turma = describeClass(entry)

        return (
          <div key={position} className="flex w-1/3 flex-col items-center gap-1">
            <div
              className={`flex size-14 items-center justify-center rounded-full border-4 bg-panel-soft font-display text-2xl font-extrabold text-ink ${style.ring}`}
            >
              {style.badge}
            </div>
            {/* sem truncate: nome grande quebra em linhas em vez de virar "..." */}
            <span className="w-full wrap-break-word text-center font-body text-sm font-bold leading-tight text-ink">
              {entry.playerName}
            </span>
            {turma && (
              <span className="w-full wrap-break-word text-center font-body text-[11px] leading-tight text-ink-soft">
                {turma}
              </span>
            )}
            <span className="font-display text-sm font-bold text-accent tabular-nums">
              {formatTime(entry.timeSeconds)}
            </span>
            <div
              className={`flex w-full ${style.height} items-start justify-center rounded-t-2xl ${style.bg} pt-1 font-display text-5xl font-extrabold text-ink-dark shadow-lg`}
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
