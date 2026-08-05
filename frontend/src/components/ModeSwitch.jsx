const OPTIONS = [
  { id: 'dig', emoji: '⛏️', label: 'Cavar', on: 'bg-accent text-ink-dark' },
  { id: 'flag', emoji: '🚩', label: 'Bandeira', on: 'bg-flag text-white' },
]

/**
 * Escolha do que o toque faz, fixa na parte de baixo da tela (perto do
 * polegar). Substituiu o menu que abria em cima de cada casa: aquele
 * cobrava dois toques por jogada, este cobra um.
 */
function ModeSwitch({ mode, onChange }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-4">
      <div className="flex w-full max-w-xs gap-2 rounded-full border-2 border-panel-line bg-panel/95 p-1.5 shadow-2xl backdrop-blur">
        {OPTIONS.map((option) => {
          const active = mode === option.id
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              aria-pressed={active}
              className={`flex h-14 flex-1 items-center justify-center gap-2 rounded-full font-display text-lg font-extrabold transition active:scale-95 ${
                active ? `${option.on} shadow-lg` : 'text-ink-soft'
              }`}
            >
              <span className="text-2xl leading-none">{option.emoji}</span>
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ModeSwitch
