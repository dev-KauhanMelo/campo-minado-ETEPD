import ControlPicker from './ControlPicker'

/**
 * Aparece sozinho na primeira visita (para o jogador escolher como quer
 * jogar antes da primeira partida) e depois só pela engrenagem.
 */
function SettingsModal({ scheme, onChangeScheme, onClose, firstTime = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-bg-deep/85 px-6 py-8 backdrop-blur-sm">
      <div className="my-auto w-full max-w-xs animate-pop-in rounded-3xl border-4 border-panel-line bg-panel p-6 shadow-2xl">
        <p className="text-center font-display text-2xl font-extrabold text-accent">
          {firstTime ? 'Como você quer jogar?' : 'Configurações'}
        </p>
        {firstTime && (
          <p className="mt-1 text-center font-body text-sm text-ink-soft">
            Dá para mudar depois na engrenagem.
          </p>
        )}

        <div className="mt-5">
          <ControlPicker value={scheme} onChange={onChangeScheme} compact />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-full bg-accent px-6 py-3 font-display text-lg font-extrabold text-ink-dark shadow-lg transition active:scale-95"
        >
          {firstTime ? 'Bora jogar!' : 'Fechar'}
        </button>
      </div>
    </div>
  )
}

export default SettingsModal
