import { useRef, useEffect } from 'react'
import { Text } from '@react-three/drei'
import { useSimStore } from '../../../store/simStore'
import * as THREE from 'three'

export function FloatingHUD() {
  const groupRef = useRef()
  const missiles = useSimStore(s => s.missiles)
  const interceptors = useSimStore(s => s.interceptors)
  const ironDome = useSimStore(s => s.ironDome)

  const activeMissiles = missiles.filter(m => m.active).length
  const activeInterceptors = interceptors.filter(i => i.active).length
  const totalIntercepted = missiles.filter(m => !m.active && m.position[1] > 0).length

  // Gentle floating animation
  useEffect(() => {
    if (!groupRef.current) return
    
    const animate = () => {
      if (groupRef.current) {
        groupRef.current.position.y = 45 + Math.sin(Date.now() * 0.001) * 0.5
        groupRef.current.rotation.y = Math.sin(Date.now() * 0.0005) * 0.05
      }
      requestAnimationFrame(animate)
    }
    
    const animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [])

  // Calculate closest threat
  const closestThreat = missiles
    .filter(m => m.active)
    .reduce((closest, missile) => {
      const dist = Math.sqrt(
        missile.position[0]**2 + 
        missile.position[1]**2 + 
        missile.position[2]**2
      )
      return dist < closest ? dist : closest
    }, Infinity)

  const threatDistance = closestThreat === Infinity ? '--' : closestThreat.toFixed(1)

  return (
    <group ref={groupRef} position={[0, 45, -30]}>
      {/* Holographic panel background */}
      <mesh position={[0, 0, -0.5]}>
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial
          color="#001a33"
          emissive="#003366"
          emissiveIntensity={0.3}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Glowing border */}
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(20, 12)]} />
        <lineBasicMaterial color="#00ffff" linewidth={2} />
      </lineSegments>

      {/* Title */}
      <Text
        position={[0, 4.5, 0]}
        fontSize={1.2}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/orbitron-bold.woff"
        outlineWidth={0.05}
        outlineColor="#003366"
      >
        DEFENSE SYSTEM STATUS
      </Text>

      {/* Stats Grid */}
      <group position={[-7, 2, 0]}>
        {/* Active Missiles */}
        <Text
          position={[0, 0, 0]}
          fontSize={0.6}
          color="#ff6666"
          anchorX="left"
          anchorY="middle"
          font="/fonts/orbitron-bold.woff"
        >
          🚀 THREATS:
        </Text>
        <Text
          position={[8, 0, 0]}
          fontSize={1.2}
          color={activeMissiles > 0 ? "#ff0000" : "#00ff00"}
          anchorX="right"
          anchorY="middle"
          font="/fonts/orbitron-bold.woff"
          outlineWidth={0.1}
          outlineColor="#000000"
        >
          {activeMissiles.toString().padStart(2, '0')}
        </Text>

        {/* Active Interceptors */}
        <Text
          position={[0, -1.5, 0]}
          fontSize={0.6}
          color="#66ccff"
          anchorX="left"
          anchorY="middle"
          font="/fonts/orbitron-bold.woff"
        >
          🔵 INTERCEPTORS:
        </Text>
        <Text
          position={[8, -1.5, 0]}
          fontSize={1.2}
          color="#00ddff"
          anchorX="right"
          anchorY="middle"
          font="/fonts/orbitron-bold.woff"
          outlineWidth={0.1}
          outlineColor="#000000"
        >
          {activeInterceptors.toString().padStart(2, '0')}
        </Text>

        {/* Successful Intercepts */}
        <Text
          position={[0, -3, 0]}
          fontSize={0.6}
          color="#66ff66"
          anchorX="left"
          anchorY="middle"
          font="/fonts/orbitron-bold.woff"
        >
          ✓ NEUTRALIZED:
        </Text>
        <Text
          position={[8, -3, 0]}
          fontSize={1.2}
          color="#00ff00"
          anchorX="right"
          anchorY="middle"
          font="/fonts/orbitron-bold.woff"
          outlineWidth={0.1}
          outlineColor="#000000"
        >
          {totalIntercepted.toString().padStart(2, '0')}
        </Text>

        {/* Closest Threat Distance */}
        <Text
          position={[0, -4.5, 0]}
          fontSize={0.6}
          color="#ffaa66"
          anchorX="left"
          anchorY="middle"
          font="/fonts/orbitron-bold.woff"
        >
          ⚠ CLOSEST:
        </Text>
        <Text
          position={[8, -4.5, 0]}
          fontSize={1.2}
          color={closestThreat < 30 ? "#ff0000" : closestThreat < 60 ? "#ffaa00" : "#00ff00"}
          anchorX="right"
          anchorY="middle"
          font="/fonts/orbitron-bold.woff"
          outlineWidth={0.1}
          outlineColor="#000000"
        >
          {threatDistance} km
        </Text>
      </group>

      {/* Pulsing alert light when threats are close */}
      {closestThreat < 30 && (
        <pointLight
          position={[0, 0, 2]}
          color="#ff0000"
          intensity={Math.sin(Date.now() * 0.01) * 50 + 50}
          distance={15}
        />
      )}

      {/* Ambient glow */}
      <pointLight
        position={[0, 0, 2]}
        color="#00ffff"
        intensity={10}
        distance={25}
      />
    </group>
  )
}