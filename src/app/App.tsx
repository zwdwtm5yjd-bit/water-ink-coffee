import { GameProvider } from './store'
import { SceneManager } from './SceneManager'
import './App.css'

function App() {
  return (
    <GameProvider>
      <div className="app">
        <SceneManager />
      </div>
    </GameProvider>
  )
}

export default App
