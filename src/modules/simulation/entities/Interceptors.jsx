import { useRef, useState, useEffect } from 'react'
import { useSimStore } from '../../../store/simStore'
import { TrackingLine } from '../components/TrackingLine'
import { Trail } from '@react-three/drei'
import * as THREE from 'three'

function InterceptorMissile({ interceptor }) {
  const ref = useRef()
  const exhaustRef = useRef()
  const [flickerIntensity, setFlickerIntensity] = useState(1)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setFlickerIntensity(0.8 + Math.random() * 0.4)
    }, 50)
    return () => clearInterval(interval)
  }, [])
  
  useEffect(() => {
    if (ref.current) {
      ref.current.position.set(...interceptor.position)
      
      const vx = interceptor.velocity[0]
      const vy = interceptor.velocity[1]
      const vz = interceptor.velocity[2]
      const speed = Math.sqrt(vx*vx + vy*vy + vz*vz)
      
      const direction = new THREE.Vector3(vx, vy, vz).normalize()
      const up = new THREE.Vector3(0, 1, 0)
      ref.current.quaternion.setFromUnitVectors(up, direction)
      
      ref.current.rotation.y += speed * 0.01
    }
    
    if (exhaustRef.current) {
      exhaustRef.current.rotation.z += 0.3
      const boostScale = (interceptor.speedMultiplier || 1) * 0.5
      exhaustRef.current.scale.setScalar(boostScale + Math.sin(Date.now() * 0.01) * 0.2)
    }
  }, [interceptor.position, interceptor.velocity, interceptor.speedMultiplier])
  
  const speedMultiplier = interceptor.speedMultiplier || 1
  const isBoosting = speedMultiplier > 1.5
  
  return (
    <Trail
      width={isBoosting ? 3.5 : 2}
      length={isBoosting ? 25 : 15}
      color={isBoosting ? "#00ffff" : "#00ddff"}
      attenuation={(t) => t * t * t}
      decay={1}
    >
      <group ref={ref}>
        {/* Main warhead */}
        <mesh castShadow>
          <coneGeometry args={[0.5, 3, 12]} />
          <meshStandardMaterial 
            color="#0066cc" 
            emissive="#0099ff" 
            emissiveIntensity={isBoosting ? 2.0 : 1.2}
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>
        
        {/* Body */}
        <mesh position={[0, -2, 0]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 1.5, 12]} />
          <meshStandardMaterial 
            color="#003366" 
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
        
        {/* Fins */}
        {[0, 90, 180, 270].map((angle, i) => (
          <mesh 
            key={i}
            position={[
              Math.cos(angle * Math.PI / 180) * 0.4,
              -2.5,
              Math.sin(angle * Math.PI / 180) * 0.4
            ]}
            rotation={[0, angle * Math.PI / 180, 0]}
            castShadow
          >
            <boxGeometry args={[0.08, 1, 0.6]} />
            <meshStandardMaterial color="#004488" metalness={0.8} />
          </mesh>
        ))}
        
        {/* Rocket exhaust glow */}
        <mesh position={[0, -3.2, 0]}>
          <sphereGeometry args={[0.8 * speedMultiplier * 0.5, 16, 16]} />
          <meshStandardMaterial 
            color={isBoosting ? "#00ffff" : "#00ccff"} 
            emissive={isBoosting ? "#00ffff" : "#00ffff"} 
            emissiveIntensity={2 * flickerIntensity * speedMultiplier * 0.5}
            transparent
            opacity={0.7}
          />
        </mesh>
        
        {/* Exhaust particles */}
        <group ref={exhaustRef} position={[0, -3.5, 0]}>
          {[...Array(isBoosting ? 10 : 6)].map((_, i) => (
            <mesh 
              key={i}
              position={[
                Math.cos(i * Math.PI / 3) * 0.5,
                -Math.random() * 0.4,
                Math.sin(i * Math.PI / 3) * 0.5
              ]}
            >
              <sphereGeometry args={[0.12, 8, 8]} />
              <meshStandardMaterial 
                color="#00ddff"
                emissive="#00ffff"
                emissiveIntensity={flickerIntensity * 2 * speedMultiplier * 0.5}
                transparent
                opacity={0.6}
              />
            </mesh>
          ))}
        </group>
        
        {/* Main light source */}
        <pointLight 
          position={[0, -2.5, 0]} 
          color="#00ccff" 
          intensity={100 * flickerIntensity * speedMultiplier * 0.5} 
          distance={30 * speedMultiplier * 0.5}
          decay={2}
        />
        
        {/* Heat seeker indicator light */}
        <pointLight 
          position={[0, 1, 0]} 
          color="#00ff00" 
          intensity={Math.sin(Date.now() * 0.015) > 0 ? 20 : 0} 
          distance={10}
        />
      </group>
    </Trail>
  )
}

function Explosion({ position, onComplete }) {
  const [scale, setScale] = useState(0)
  const [opacity, setOpacity] = useState(1)
  
  useEffect(() => {
    const startTime = Date.now()
    const duration = 1000
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = elapsed / duration
      
      if (progress >= 1) {
        onComplete()
        return
      }
      
      setScale(progress * 8)
      setOpacity(1 - progress)
      requestAnimationFrame(animate)
    }
    
    animate()
  }, [onComplete])
  
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[scale, 16, 16]} />
        <meshBasicMaterial 
          color="#ff6600" 
          transparent 
          opacity={opacity * 0.8}
        />
      </mesh>
      <pointLight 
        color="#ff6600" 
        intensity={200 * opacity} 
        distance={50}
      />
    </group>
  )
}

export default function Interceptors() {
  const interceptors = useSimStore(s => s.interceptors)
  const missiles = useSimStore(s => s.missiles)
  const [explosions, setExplosions] = useState([])
  
  useEffect(() => {
    const exploded = interceptors.filter(i => i.exploded && !explosions.find(e => e.id === i.id))
    if (exploded.length > 0) {
      setExplosions(prev => [...prev, ...exploded.map(i => ({ 
        id: i.id, 
        position: i.explosionPos 
      }))])
    }
  }, [interceptors])
  
  return (
    <>
      {interceptors.filter(i => i.active).map(interceptor => {
        const targetMissile = missiles.find(m => m.id === interceptor.targetId)
        
        return (
          <group key={interceptor.id}>
            <InterceptorMissile interceptor={interceptor} />
            <TrackingLine interceptor={interceptor} targetMissile={targetMissile} />
          </group>
        )
      })}
      
      {explosions.map(explosion => (
        <Explosion 
          key={explosion.id}
          position={explosion.position}
          onComplete={() => setExplosions(prev => prev.filter(e => e.id !== explosion.id))}
        />
      ))}
    </>
  )
}




