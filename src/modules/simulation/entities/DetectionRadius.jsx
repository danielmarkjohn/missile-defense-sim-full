import { useSimStore } from '../../../store/simStore'
import { RadarPing, RadarScanBeam } from '../components/RadarPing'

export default function DetectionRadius() {
  const { position, detectionRadius } = useSimStore(s => s.ironDome)
  
  return (
    <group>
      {/* Detection sphere - more visible */}
      <mesh position={position}>
        <sphereGeometry args={[detectionRadius, 32, 32]} />
        <meshBasicMaterial 
          color="#00ff00" 
          wireframe 
          transparent 
          opacity={0.25}
        />
      </mesh>
      
      {/* Solid ring at ground level for high visibility */}
      <mesh position={[position[0], 0.2, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[detectionRadius - 1, detectionRadius, 64]} />
        <meshBasicMaterial 
          color="#00ff00" 
          transparent 
          opacity={0.6}
          side={2}
        />
      </mesh>
      
      {/* Additional concentric rings for scale */}
      <mesh position={[position[0], 0.15, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[detectionRadius * 0.5 - 0.5, detectionRadius * 0.5, 64]} />
        <meshBasicMaterial 
          color="#00ff00" 
          transparent 
          opacity={0.4}
          side={2}
        />
      </mesh>
      
      <mesh position={[position[0], 0.1, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[detectionRadius * 0.25 - 0.3, detectionRadius * 0.25, 64]} />
        <meshBasicMaterial 
          color="#00ff00" 
          transparent 
          opacity={0.3}
          side={2}
        />
      </mesh>
      
      {/* Radar pings */}
      <RadarPing position={position} radius={detectionRadius} color="#00ff00" speed={1.5} />
      <RadarPing position={position} radius={detectionRadius * 0.5} color="#00ff00" speed={2} />
      <RadarPing position={position} radius={detectionRadius * 0.25} color="#00ff00" speed={2.5} />
      
      {/* Scanning beam */}
      <RadarScanBeam position={position} radius={detectionRadius} rotationSpeed={0.8} />
    </group>
  )
}

