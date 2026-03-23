import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

export function Explosion({ position, onComplete }) {
  const groupRef = useRef()
  const [scale, setScale] = useState(0)
  const [opacity, setOpacity] = useState(1)
  const [particlePositions] = useState(() => {
    // Generate random particle positions
    return Array.from({ length: 30 }, () => ({
      offset: [
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ],
      velocity: [
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8
      ],
      size: 0.2 + Math.random() * 0.4
    }))
  })

  useEffect(() => {
    const startTime = Date.now()
    const duration = 1500 // 1.5 seconds

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Expand rapidly then slow down
      const expansionCurve = progress < 0.3 
        ? progress * 10 
        : 3 + (progress - 0.3) * 2

      setScale(expansionCurve)
      setOpacity(1 - progress)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        onComplete?.()
      }
    }

    animate()
  }, [onComplete])

  return (
    <group ref={groupRef} position={position}>
      {/* Central flash */}
      <mesh>
        <sphereGeometry args={[1 * scale, 16, 16]} />
        <meshStandardMaterial
          color="#ffaa00"
          emissive="#ff6600"
          emissiveIntensity={5 * opacity}
          transparent
          opacity={opacity * 0.8}
        />
      </mesh>

      {/* Shockwave ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5 * scale, 2 * scale, 32]} />
        <meshStandardMaterial
          color="#ff4400"
          emissive="#ff6600"
          emissiveIntensity={3 * opacity}
          transparent
          opacity={opacity * 0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Expanding fireball */}
      <mesh>
        <sphereGeometry args={[1.5 * scale, 16, 16]} />
        <meshStandardMaterial
          color="#ff0000"
          emissive="#ff3300"
          emissiveIntensity={4 * opacity}
          transparent
          opacity={opacity * 0.6}
        />
      </mesh>

      {/* Debris particles */}
      {particlePositions.map((particle, i) => {
        const particleScale = scale * 0.5
        return (
          <mesh
            key={i}
            position={[
              particle.offset[0] + particle.velocity[0] * scale * 0.3,
              particle.offset[1] + particle.velocity[1] * scale * 0.3,
              particle.offset[2] + particle.velocity[2] * scale * 0.3
            ]}
          >
            <sphereGeometry args={[particle.size * particleScale, 6, 6]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? "#ffaa00" : i % 3 === 1 ? "#ff6600" : "#ff0000"}
              emissive={i % 3 === 0 ? "#ffaa00" : i % 3 === 1 ? "#ff6600" : "#ff0000"}
              emissiveIntensity={3 * opacity}
              transparent
              opacity={opacity}
            />
          </mesh>
        )
      })}

      {/* Explosion light */}
      <pointLight
        color="#ff6600"
        intensity={200 * opacity}
        distance={30 * scale}
        decay={2}
      />

      {/* Secondary flash */}
      <pointLight
        color="#ffaa00"
        intensity={150 * opacity}
        distance={20 * scale}
        decay={2}
      />
    </group>
  )
}