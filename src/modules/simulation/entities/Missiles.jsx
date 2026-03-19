import { useRef, useEffect, useState } from 'react'
import { useSimStore } from '../../../store/simStore'
import { Trail } from '@react-three/drei'
import * as THREE from 'three'

function Missile({ missile }) {
  const ref = useRef()
  const exhaustRef = useRef()
  const [flickerIntensity, setFlickerIntensity] = useState(1)
  
  useEffect(() => {
    // Realistic flicker effect for rocket exhaust
    const interval = setInterval(() => {
      setFlickerIntensity(0.8 + Math.random() * 0.4)
    }, 50)
    return () => clearInterval(interval)
  }, [])
  
  useEffect(() => {
    if (ref.current) {
      ref.current.position.set(...missile.position)
      
      const vx = missile.velocity[0]
      const vy = missile.velocity[1]
      const vz = missile.velocity[2]
      const speed = Math.sqrt(vx*vx + vy*vy + vz*vz)
      
      // Realistic orientation - missile points in direction of travel
      const direction = new THREE.Vector3(vx, vy, vz).normalize()
      const up = new THREE.Vector3(0, 1, 0)
      ref.current.quaternion.setFromUnitVectors(up, direction)
      
      // Spin effect for realism
      ref.current.rotation.y += speed * 0.01
    }
    
    // Animate exhaust particles
    if (exhaustRef.current) {
      exhaustRef.current.rotation.z += 0.3
      exhaustRef.current.scale.setScalar(0.8 + Math.sin(Date.now() * 0.01) * 0.2)
    }
  }, [missile.position, missile.velocity])
  
  return (
    <Trail
      width={2.5}
      length={20}
      color="#ff6644"
      attenuation={(t) => t * t * t}
      decay={1}
    >
      <group ref={ref}>
        {/* Main warhead */}
        <mesh castShadow>
          <coneGeometry args={[0.7, 4, 12]} />
          <meshStandardMaterial 
            color="#cc0000" 
            emissive="#ff0000" 
            emissiveIntensity={1.5}
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
        
        {/* Body */}
        <mesh position={[0, -2.5, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 2, 12]} />
          <meshStandardMaterial 
            color="#444" 
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
        
        {/* Fins */}
        {[0, 90, 180, 270].map((angle, i) => (
          <mesh 
            key={i}
            position={[
              Math.cos(angle * Math.PI / 180) * 0.5,
              -3.2,
              Math.sin(angle * Math.PI / 180) * 0.5
            ]}
            rotation={[0, angle * Math.PI / 180, 0]}
            castShadow
          >
            <boxGeometry args={[0.1, 1.2, 0.8]} />
            <meshStandardMaterial color="#666" metalness={0.8} />
          </mesh>
        ))}
        
        {/* Rocket exhaust glow */}
        <mesh position={[0, -4, 0]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial 
            color="#ff4400" 
            emissive="#ff6600" 
            emissiveIntensity={2.5 * flickerIntensity}
            transparent
            opacity={0.7}
          />
        </mesh>
        
        {/* Exhaust particles */}
        <group ref={exhaustRef} position={[0, -4.5, 0]}>
          {[...Array(8)].map((_, i) => (
            <mesh 
              key={i}
              position={[
                Math.cos(i * Math.PI / 4) * 0.6,
                -Math.random() * 0.5,
                Math.sin(i * Math.PI / 4) * 0.6
              ]}
            >
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial 
                color="#ffaa00"
                emissive="#ff6600"
                emissiveIntensity={flickerIntensity * 2}
                transparent
                opacity={0.6}
              />
            </mesh>
          ))}
        </group>
        
        {/* Main light source */}
        <pointLight 
          position={[0, -3, 0]} 
          color="#ff4400" 
          intensity={120 * flickerIntensity} 
          distance={35}
          decay={2}
        />
        
        {/* Warning strobe light */}
        <pointLight 
          position={[0, 1, 0]} 
          color="#ff0000" 
          intensity={Math.sin(Date.now() * 0.02) > 0 ? 30 : 0} 
          distance={15}
        />
      </group>
    </Trail>
  )
}

export default function Missiles() {
  const missiles = useSimStore(s => s.missiles)
  
  return (
    <>
      {missiles.map(missile => (
        <Missile key={missile.id} missile={missile} />
      ))}
    </>
  )
}


