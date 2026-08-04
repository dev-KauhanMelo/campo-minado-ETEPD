import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import HomePage from './pages/HomePage'

const NewGamePage = lazy(() => import('./pages/NewGamePage'))
const GamePage = lazy(() => import('./pages/GamePage'))
const RankingPage = lazy(() => import('./pages/RankingPage'))

function PageFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="font-body text-ink-soft">Carregando…</p>
    </main>
  )
}

function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/novo-jogo" element={<NewGamePage />} />
        <Route path="/jogo/:gameId" element={<GamePage />} />
        <Route path="/ranking" element={<RankingPage />} />
      </Routes>
    </Suspense>
  )
}

export default App
