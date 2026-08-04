import { Route, Routes } from 'react-router-dom'

import GamePage from './pages/GamePage'
import HomePage from './pages/HomePage'
import NewGamePage from './pages/NewGamePage'
import RankingPage from './pages/RankingPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/novo-jogo" element={<NewGamePage />} />
      <Route path="/jogo/:gameId" element={<GamePage />} />
      <Route path="/ranking" element={<RankingPage />} />
    </Routes>
  )
}

export default App
