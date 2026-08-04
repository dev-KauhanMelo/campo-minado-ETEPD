function Credits({ className = '' }) {
  return (
    <footer
      className={`flex items-center justify-center gap-2 font-body text-xs text-ink-soft ${className}`}
    >
      <img
        src="/kauhan-face.png"
        alt="Personagem do Kauhan Rodrigues"
        width="32"
        height="32"
        className="size-8 rounded-full border-2 border-accent/70 bg-panel-soft object-cover"
      />
      <span>
        Desenvolvido por <strong className="text-accent">Kauhan Rodrigues</strong>
      </span>
    </footer>
  )
}

export default Credits
