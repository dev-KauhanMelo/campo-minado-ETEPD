const SCHEMES = [
  {
    id: 'botoes',
    emoji: '🎛️',
    title: 'Com botões',
    hint: 'Escolhe cavar ou bandeira na barra e toca nas casas',
  },
  {
    id: 'rapido',
    emoji: '⚡',
    title: 'Rápido',
    hint: 'Toque cava · segure para marcar bandeira',
  },
]

/** Só faz sentido em aparelho de toque: no mouse o botão direito resolve. */
function ControlPicker({ value, onChange, compact = false }) {
  return (
    <div className={compact ? '' : 'rounded-2xl border-2 border-panel-line/60 bg-panel/70 p-4'}>
      <p className="font-display text-sm font-bold text-accent">Controles no celular</p>
      <div className="mt-2 flex flex-col gap-2">
        {SCHEMES.map((scheme) => {
          const active = value === scheme.id
          return (
            <button
              key={scheme.id}
              type="button"
              onClick={() => onChange(scheme.id)}
              aria-pressed={active}
              className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2 text-left transition ${
                active ? 'border-accent bg-accent/15' : 'border-panel-line bg-bg-deep'
              }`}
            >
              <span className="text-xl">{scheme.emoji}</span>
              <span className="flex-1">
                <span className="block font-display text-sm font-bold text-ink">
                  {scheme.title}
                </span>
                <span className="block font-body text-xs leading-tight text-ink-soft">
                  {scheme.hint}
                </span>
              </span>
              {active && <span className="font-display text-accent">✓</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ControlPicker
