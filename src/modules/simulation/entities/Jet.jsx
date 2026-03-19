import { useRef, useEffect } from 'react'
import { useSimStore } from '../../../store/simStore'
import { Trail } from '@react-three/drei'
import * as THREE from 'three'

export default function Jet() {
  const jet = useSimStore(s => s.jet)
  const meshRef = useRef()
  
  useEffect(() => {
    if (meshRef.current && jet.active) {
      meshRef.current.position.set(...jet.position)
      
      // Orient jet in direction of travel
      const direction = new THREE.Vector3(...jet.velocity).normalize()
      const up = new THREE.Vector3(0, 1, 0)
      meshRef.current.quaternion.setFromUnitVectors(up, direction)
      meshRef.current.rotateX(Math.PI / 2)
    }
  }, [jet.position, jet.velocity, jet.active])
  
  if (!jet.active) return null
  
  return (
    <Trail
      width={4}
      length={20}
      color="#ffffff"
      attenuation={(t) => t * t}
      decay={1}
    >
      <group ref={meshRef}>
        {/* Fuselage - larger and more visible */}
        <mesh castShadow>
          <cylinderGeometry args={[0.6, 0.8, 7, 16]} />
          <meshStandardMaterial 
            color="#4a4a4a" 
            metalness={0.9}
            roughness={0.1}
            emissive="#2a2a2a"
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* Nose cone */}
        <mesh position={[0, 4, 0]} castShadow>
          <coneGeometry args={[0.6, 2, 16]} />
          <meshStandardMaterial 
            color="#3a3a3a" 
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        
        {/* Wings - larger and brighter */}
        <mesh position={[0, -0.5, 0]} rotation={[0, 0, 0]} castShadow>
          <boxGeometry args={[12, 0.3, 2.5]} />
          <meshStandardMaterial 
            color="#555555" 
            metalness={0.8}
            emissive="#333333"
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Wing tips - bright markers */}
        <mesh position={[6, -0.5, 0]} castShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial 
            color="#ff0000" 
            emissive="#ff0000"
            emissiveIntensity={2}
          />
        </mesh>
        <mesh position={[-6, -0.5, 0]} castShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial 
            color="#00ff00" 
            emissive="#00ff00"
            emissiveIntensity={2}
          />
        </mesh>
        
        {/* Tail fins */}
        <mesh position={[0, -3.5, 0]} rotation={[0, 0, 0]} castShadow>
          <boxGeometry args={[4, 0.3, 2]} />
          <meshStandardMaterial 
            color="#555555" 
            metalness={0.8}
          />
        </mesh>
        
        <mesh position={[0, -3.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <boxGeometry args={[3, 0.3, 2]} />
          <meshStandardMaterial 
            color="#555555" 
            metalness={0.8}
          />
        </mesh>
        
        {/* Engine glow - larger and brighter */}
        <mesh position={[0, -4.5, 0]}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshStandardMaterial 
            color="#ff8800" 
            emissive="#ff4400"
            emissiveIntensity={3}
            transparent
            opacity={0.9}
          />
        </mesh>
        
        {/* Cockpit canopy */}
        <mesh position={[0, 2, 0]} castShadow>
          <sphereGeometry args={[0.7, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial 
            color="#88ccff" 
            transparent
            opacity={0.6}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        
        {/* Navigation lights - brighter */}
        <pointLight position={[6, 0, 0]} color="#ff0000" intensity={10} distance={15} />
        <pointLight position={[-6, 0, 0]} color="#00ff00" intensity={10} distance={15} />
        <pointLight position={[0, -4.5, 0]} color="#ff6600" intensity={25} distance={30} />
        <pointLight position={[0, 2, 0]} color="#ffffff" intensity={5} distance={10} />
      </group>
    </Trail>
  )
}



