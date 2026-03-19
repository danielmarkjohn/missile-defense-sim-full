import { Canvas } from '@react-three/fiber'
import Scene from './Scene'
import Sidebar from './Sidebar'

export default function Simulation() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas shadows>
        <Scene />
      </Canvas>
      <Sidebar />
    </div>
  )
}
