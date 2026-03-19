import { useFrame } from '@react-three/fiber'
import { useSimStore } from '../../store/simStore'

export default function SimulationEngine() {
  const step = useSimStore(s => s.step)
  
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1) // Cap delta to prevent huge jumps
    step(dt)
  })
  
  return null
}