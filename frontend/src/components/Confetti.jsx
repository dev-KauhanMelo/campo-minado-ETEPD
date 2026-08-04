import { useMemo } from 'react'

const COLORS = ['#8FE3B5', '#FFD166', '#FF5A5F', '#6C5CE7', '#3B82F6', '#22A559']
const PARTICLE_COUNT = 40

function randomBetween(min, max) {
  return min + Math.random() * (max - min)
}

function Confetti() {
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        left: randomBetween(0, 100),
        delay: randomBetween(0, 0.6),
        duration: randomBetween(2.2, 3.6),
        color: COLORS[i % COLORS.length],
        size: randomBetween(6, 12),
      })),
    [],
  )

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute top-[-5%] animate-confetti-fall rounded-sm"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.4,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

export default Confetti
