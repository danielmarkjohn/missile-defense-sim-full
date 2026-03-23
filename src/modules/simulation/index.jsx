import { Canvas } from '@react-three/fiber'
import { useEffect, useState, Suspense } from 'react'
import Scene from './Scene'
import Sidebar from './Sidebar'
import LoadingScreen from './components/LoadingScreen'
import { useSimStore } from '../../store/simStore'

export default function Simulation() {
  const [isLoading, setIsLoading] = useState(true)

  // Periodic cleanup of inactive objects
  useEffect(() => {
    const cleanup = useSimStore.getState().cleanup
    const interval = setInterval(() => {
      cleanup()
    }, 5000) // Cleanup every 5 seconds

    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Suspense fallback={null}>
        <Canvas shadows dpr={[1, 2]} performance={{ min: 0.5 }}>
          <Scene />
        </Canvas>
      </Suspense>
      <Sidebar />
    </div>
  )
}
