import { useEffect } from 'react'

function PauseMenu({ onResume, onRestart, onExit, restarting }) {
  useEffect(() => {
    function handleKey(event) {
      if (event.key === 'Escape') onResume()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onResume])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-deep/80 px-6 backdrop-blur-sm">
      <div className="w-full max-w-xs animate-pop-in rounded-3xl border-4 border-panel-line bg-panel p-6 text-center shadow-2xl">
        <p className="font-display text-3xl font-extrabold text-accent">Pausa</p>
        <p className="mt-1 font-body text-sm text-ink-soft">
          O cronômetro está parado.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={onResume}
            className="rounded-full bg-accent px-6 py-3 font-display text-lg font-extrabold text-ink-dark shadow-lg transition active:scale-95"
          >
            ▶ Continuar
          </button>
          <button
            type="button"
            onClick={onRestart}
            disabled={restarting}
            className="rounded-full border-2 border-panel-line bg-panel-soft px-6 py-3 font-display font-bold text-ink transition active:scale-95 disabled:opacity-60"
          >
            {restarting ? 'Preparando…' : '🔄 Recomeçar'}
          </button>
          <button
            type="button"
            onClick={onExit}
            className="rounded-full border-2 border-danger/70 px-6 py-3 font-display font-bold text-danger transition active:scale-95"
          >
            🚪 Sair para o menu
          </button>
        </div>
      </div>
    </div>
  )
}

export default PauseMenu
