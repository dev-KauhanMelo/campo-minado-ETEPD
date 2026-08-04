const numberColors = [1, 2, 3, 4, 5, 6, 7, 8]

// Classes literais (não interpoladas) para o scanner estático do Tailwind detectar.
const NUM_TEXT_CLASS = {
  1: 'text-num-1',
  2: 'text-num-2',
  3: 'text-num-3',
  4: 'text-num-4',
  5: 'text-num-5',
  6: 'text-num-6',
  7: 'text-num-7',
  8: 'text-num-8',
}

function App() {
  return (
    <div className="min-h-screen bg-bg p-8">
      <h1 className="font-display text-4xl font-bold text-accent">
        Campo Minado ETEPD
      </h1>
      <p className="mt-1 font-body text-ink-soft">Prévia dos design tokens</p>

      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold text-ink">
          Células
        </h2>
        <div className="mt-3 grid w-fit grid-cols-4 gap-1 rounded-lg bg-surface p-3 shadow">
          <div className="size-12 rounded bg-cell-closed-a" />
          <div className="size-12 rounded bg-cell-closed-b" />
          <div className="size-12 rounded bg-cell-open-a" />
          <div className="size-12 rounded bg-cell-open-b" />
          <div className="flex size-12 items-center justify-center rounded bg-cell-open-a text-2xl font-extrabold text-flag">
            ⚑
          </div>
          <div className="flex size-12 items-center justify-center rounded bg-mine-bg-hit text-2xl">
            💣
          </div>
          <div className="flex size-12 items-center justify-center rounded bg-gold font-display font-bold text-ink">
            1º
          </div>
          <div className="flex size-12 items-center justify-center rounded bg-silver font-display font-bold text-ink">
            2º
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold text-ink">
          Números
        </h2>
        <div className="mt-3 grid w-fit grid-cols-8 gap-1 rounded-lg bg-surface p-3 shadow">
          {numberColors.map((n) => (
            <div
              key={n}
              className={`flex size-12 items-center justify-center rounded bg-cell-open-a text-xl font-extrabold ${NUM_TEXT_CLASS[n]}`}
            >
              {n}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <button
          type="button"
          className="rounded-full bg-accent px-6 py-2 font-display font-semibold text-white shadow transition active:scale-95"
        >
          Novo Jogo
        </button>
      </section>
    </div>
  )
}

export default App
