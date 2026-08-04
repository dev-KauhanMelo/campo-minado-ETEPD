import { useEffect } from 'react'
import { createPortal } from 'react-dom'

const MENU_WIDTH = 184
const MENU_HEIGHT = 60
const MARGIN = 8

/**
 * Menu que aparece ao tocar uma célula no celular: em vez de segurar o
 * dedo para marcar bandeira (que era difícil de acertar), o jogador
 * escolhe entre cavar e marcar.
 *
 * Fica em position:fixed via portal porque o tabuleiro vive dentro de um
 * container com scroll, que cortaria o menu.
 */
function CellActionMenu({ anchor, flagged, onDig, onFlag, onClose }) {
  useEffect(() => {
    function handleKey(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    // Rolar a tela desalinharia o menu da célula: mais simples fechá-lo.
    window.addEventListener('scroll', onClose, true)
    return () => {
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('scroll', onClose, true)
    }
  }, [onClose])

  const centerX = anchor.left + anchor.width / 2
  const left = Math.min(
    Math.max(MARGIN, centerX - MENU_WIDTH / 2),
    window.innerWidth - MENU_WIDTH - MARGIN,
  )

  const above = anchor.top - MENU_HEIGHT - MARGIN
  const below = anchor.bottom + MARGIN
  const top = above >= MARGIN ? above : below

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Fechar menu"
        onClick={onClose}
        className="fixed inset-0 z-40 cursor-default bg-bg-deep/30"
      />
      <div
        role="menu"
        style={{ left, top, width: MENU_WIDTH, height: MENU_HEIGHT }}
        className="fixed z-50 flex animate-pop-in items-center gap-2 rounded-2xl border-2 border-panel-line bg-panel p-2 shadow-2xl"
      >
        <button
          type="button"
          role="menuitem"
          onClick={onDig}
          disabled={flagged}
          className="flex h-full flex-1 flex-col items-center justify-center rounded-xl bg-accent font-display text-xs font-extrabold text-ink-dark transition active:scale-95 disabled:opacity-40"
        >
          <span className="text-lg leading-none">⛏️</span>
          Cavar
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={onFlag}
          className="flex h-full flex-1 flex-col items-center justify-center rounded-xl bg-flag font-display text-xs font-extrabold text-white transition active:scale-95"
        >
          <span className="text-lg leading-none">🚩</span>
          {flagged ? 'Tirar' : 'Marcar'}
        </button>
      </div>
    </>,
    document.body,
  )
}

export default CellActionMenu
