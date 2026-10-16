import { StrictMode, Suspense, lazy, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const GameApp = lazy(() => import('./game/GameApp.jsx'))

const isGame = () => window.location.hash.startsWith('#/ai-master')

function Root() {
  const [game, setGame] = useState(isGame)
  useEffect(() => {
    const h = () => setGame(isGame())
    window.addEventListener('hashchange', h)
    return () => window.removeEventListener('hashchange', h)
  }, [])
  if (!game) return <App />
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center text-xl font-bold">載入中…</div>}>
      <GameApp />
    </Suspense>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
