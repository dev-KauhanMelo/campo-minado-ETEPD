import { useMemo } from 'react'

const COLORS = ['#FFC93C', '#AAD751', '#FF8A5B', '#7C5CFF', '#4ADE80', '#E5C29F']
const PARTICLE_COUNT = 60

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
