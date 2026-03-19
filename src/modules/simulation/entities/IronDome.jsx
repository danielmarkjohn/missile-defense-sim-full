import { useSimStore } from '../../../store/simStore'

export default function IronDome() {
  const { position } = useSimStore(s => s.ironDome)
  
  return (
    <group position={position}>
      {/* Base platform */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[5, 6, 1, 8]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Main tower */}
      <mesh position={[0, 3, 0]} castShadow>
        <cylinderGeometry args={[3, 3, 5, 8]} />
        <meshStandardMaterial color="#34495e" metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Radar dome */}
      <mesh position={[0, 6.5, 0]} castShadow>
        <sphereGeometry args={[2.5, 16, 16]} />
        <meshStandardMaterial 
          color="#3498db" 
          transparent 
          opacity={0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Launcher tubes */}
      {[0, 90, 180, 270].map((angle, i) => (
        <group key={i} rotation={[0, angle * Math.PI / 180, 0]}>
          <mesh position={[4, 2, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
            <cylinderGeometry args={[0.4, 0.4, 4, 8]} />
            <meshStandardMaterial color="#7f8c8d" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      ))}
      
      {/* Status lights */}
      <pointLight position={[0, 7, 0]} color="#00ff00" intensity={50} distance={20} />
      <pointLight position={[0, 2, 0]} color="#3498db" intensity={30} distance={15} />
    </group>
  )
}


