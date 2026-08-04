import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 bg-bg px-6 text-center">
      <div>
        <p className="font-body text-sm font-bold uppercase tracking-widest text-accent">
          ETE Porto Digital
        </p>
        <h1 className="mt-2 font-display text-5xl font-extrabold text-ink">
          Campo Minado
        </h1>
        <p className="mt-3 font-body text-ink-soft">
          Jogue, compita e apareça no ranking da escola.
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-4">
        <Link
          to="/novo-jogo"
          className="rounded-full bg-accent px-8 py-4 font-display text-lg font-bold text-white shadow-lg transition active:scale-95"
        >
          Novo Jogo
        </Link>
        <Link
          to="/ranking"
          className="rounded-full border-2 border-accent bg-surface px-8 py-4 font-display text-lg font-bold text-accent shadow transition active:scale-95"
        >
          Ver Ranking
        </Link>
      </div>
    </main>
  )
}

export default HomePage
