import { useRef, useEffect, useState } from 'react'
import { useSimStore } from '../../../store/simStore'
import { Trail } from '@react-three/drei'
import * as THREE from 'three'

function Interceptor({ interceptor }) {
  const ref = useRef()
  const thrusterRef = useRef()
  const [pulseIntensity, setPulseIntensity] = useState(1)
  
  useEffect(() => {
    // Pulse effect for interceptor thrusters
    const interval = setInterval(() => {
      setPulseIntensity(0.7 + Math.random() * 0.6)
    }, 40)
    return () => clearInterval(interval)
  }, [])
  
  useEffect(() => {
    if (ref.current) {
      ref.current.position.set(...interceptor.position)
      
      const vx = interceptor.velocity[0]
      const vy = interceptor.velocity[1]
      const vz = interceptor.velocity[2]
      const speed = Math.sqrt(vx*vx + vy*vy + vz*vz)
      
      // Point in direction of travel
      const direction = new THREE.Vector3(vx, vy, vz).normalize()
      const up = new THREE.Vector3(0, 1, 0)
      ref.current.quaternion.setFromUnitVectors(up, direction)
      
      // Slight wobble for realism
      ref.current.rotation.z += Math.sin(Date.now() * 0.01) * 0.02
    }
    
    if (thrusterRef.current) {
      thrusterRef.current.rotation.y += 0.4
    }
  }, [interceptor.position, interceptor.velocity])
  
  return (
    <Trail
      width={2}
      length={18}
      color="#00ddff"
      attenuation={(t) => t * t}
      decay={1}
    >
      <group ref={ref}>
        {/* Nose cone */}
        <mesh castShadow>
          <coneGeometry args={[0.4, 2, 12]} />
          <meshStandardMaterial 
            color="#ffffff" 
            emissive="#00aaff" 
            emissiveIntensity={2}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        
        {/* Main body */}
        <mesh position={[0, -1.5, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 2, 12]} />
          <meshStandardMaterial 
            color="#e0e0e0" 
            metalness={0.95}
            roughness={0.05}
          />
        </mesh>
        
        {/* Guidance fins */}
        {[0, 120, 240].map((angle, i) => (
          <mesh 
            key={i}
            position={[
              Math.cos(angle * Math.PI / 180) * 0.35,
              -2.3,
              Math.sin(angle * Math.PI / 180) * 0.35
            ]}
            rotation={[0, angle * Math.PI / 180, 0]}
            castShadow
          >
            <boxGeometry args={[0.08, 0.8, 0.6]} />
            <meshStandardMaterial 
              color="#00aaff" 
              emissive="#0088cc"
              emissiveIntensity={0.5}
              metalness={0.8} 
            />
          </mesh>
        ))}
        
        {/* Thruster glow */}
        <mesh position={[0, -3, 0]}>
          <sphereGeometry args={[0.9, 16, 16]} />
          <meshStandardMaterial 
            color="#00ffff" 
            emissive="#00ffff" 
            emissiveIntensity={3.5 * pulseIntensity}
            transparent
            opacity={0.8}
          />
        </mesh>
        
        {/* Thruster particles */}
        <group ref={thrusterRef} position={[0, -3.5, 0]}>
          {[...Array(6)].map((_, i) => (
            <mesh 
              key={i}
              position={[
                Math.cos(i * Math.PI / 3) * 0.4,
                -Math.random() * 0.3,
                Math.sin(i * Math.PI / 3) * 0.4
              ]}
            >
              <sphereGeometry args={[0.12, 8, 8]} />
              <meshStandardMaterial 
                color="#00ffff"
                emissive="#00ddff"
                emissiveIntensity={pulseIntensity * 3}
                transparent
                opacity={0.7}
              />
            </mesh>
          ))}
        </group>
        
        {/* Main thruster light */}
        <pointLight 
          position={[0, -2.5, 0]} 
          color="#00ffff" 
          intensity={150 * pulseIntensity} 
          distance={40}
          decay={2}
        />
        
        {/* Navigation lights */}
        <pointLight 
          position={[0, 0.5, 0]} 
          color="#00ff00" 
          intensity={Math.sin(Date.now() * 0.015) > 0 ? 20 : 0} 
          distance={12}
        />
        
        {/* Targeting laser effect */}
        {interceptor.targetPoint && (
          <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
            <meshStandardMaterial 
              color="#ff0000"
              emissive="#ff0000"
              emissiveIntensity={1.5}
              transparent
              opacity={0.3}
            />
          </mesh>
        )}
      </group>
    </Trail>
  )
}

export default function Interceptors() {
  const interceptors = useSimStore(s => s.interceptors)
  
  return (
    <>
      {interceptors.map(interceptor => (
        <Interceptor key={interceptor.id} interceptor={interceptor} />
      ))}
    </>
  )
}





