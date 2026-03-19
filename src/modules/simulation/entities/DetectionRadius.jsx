import { useSimStore } from '../../../store/simStore'

export default function DetectionRadius() {
  const { position, detectionRadius } = useSimStore(s => s.ironDome)
  
  return (
    <>
      {/* Detection radius ring */}
      <mesh position={[position[0], 0.1, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[detectionRadius - 1, detectionRadius, 64]} />
        <meshBasicMaterial color="#00ff00" transparent opacity={0.4} side={2} />
      </mesh>
      
      {/* Pulsing inner circle */}
      <mesh position={[position[0], 0.05, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[detectionRadius, 64]} />
        <meshBasicMaterial 
          color="#00ff00" 
          transparent 
          opacity={0.1 + Math.sin(Date.now() * 0.002) * 0.05} 
          side={2}
        />
      </mesh>
    </>
  )
}

