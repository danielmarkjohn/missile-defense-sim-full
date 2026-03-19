import { useRef, useEffect } from 'react'
import { useSimStore } from '../../../store/simStore'
import * as THREE from 'three'

export default function Jet() {
  const jet = useSimStore(s => s.jet)
  const ref = useRef()
  
  useEffect(() => {
    if (ref.current && jet.active) {
      ref.current.position.set(...jet.position)
      
      // Point in direction of travel
      const direction = new THREE.Vector3(...jet.velocity).normalize()
      const up = new THREE.Vector3(0, 1, 0)
      ref.current.quaternion.setFromUnitVectors(up, direction)
      ref.current.rotateZ(Math.PI / 2) // Align jet properly
    }
  }, [jet.position, jet.active])
  
  if (!jet.active) return null
  
  return (
    <group ref={ref}>
      {/* Fuselage */}
      <mesh castShadow>
        <cylinderGeometry args={[0.8, 0.5, 8, 8]} />
        <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Cockpit */}
      <mesh position={[0, 3, 0]} castShadow>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial 
          color="#1a202c" 
          metalness={0.9} 
          roughness={0.1}
          transparent
          opacity={0.6}
        />
      </mesh>
      
      {/* Wings */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <boxGeometry args={[12, 0.3, 3]} />
        <meshStandardMaterial color="#2d3748" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Tail */}
      <mesh position={[0, -3, 0]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.3, 3, 4]} />
        <meshStandardMaterial color="#2d3748" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Engine glow */}
      <pointLight position={[0, -4, 0]} color="#ff6600" intensity={200} distance={30} />
      
      {/* Navigation lights */}
      <pointLight position={[6, 0, 0]} color="#ff0000" intensity={50} distance={15} />
      <pointLight position={[-6, 0, 0]} color="#00ff00" intensity={50} distance={15} />
    </group>
  )
}



