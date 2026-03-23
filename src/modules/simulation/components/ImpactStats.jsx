import { useRef, useEffect, useState } from 'react'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

export function ImpactStats({ position, stats, onComplete }) {
  const groupRef = useRef()
  const [opacity, setOpacity] = useState(0)
  const [scale, setScale] = useState(0.5)
  const [yOffset, setYOffset] = useState(0)

  useEffect(() => {
    if (!stats) {
      onComplete?.()
      return
    }

    const startTime = Date.now()
    const displayDuration = 3000
    const fadeInDuration = 200
    const fadeOutStart = 2500

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = elapsed / displayDuration

      if (elapsed < fadeInDuration) {
        setOpacity(elapsed / fadeInDuration)
        setScale(0.5 + (elapsed / fadeInDuration) * 0.5)
      } else if (elapsed < fadeOutStart) {
        setOpacity(1)
        setScale(1)
      } else {
        const fadeProgress = (elapsed - fadeOutStart) / (displayDuration - fadeOutStart)
        setOpacity(1 - fadeProgress)
      }

      setYOffset((elapsed / displayDuration) * 8)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        onComplete?.()
      }
    }

    animate()
  }, [onComplete, stats])

  if (!stats || !position) return null

  return (
    <group ref={groupRef} position={[position[0], position[1] + yOffset, position[2]]}>
      {/* Holographic panel background */}
      <mesh position={[0, 0, -0.2]}>
        <planeGeometry args={[8, 5]} />
        <meshStandardMaterial
          color="#001a1a"
          emissive="#003333"
          emissiveIntensity={0.5 * opacity}
          transparent
          opacity={0.6 * opacity}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Glowing border */}
      <lineSegments position={[0, 0, -0.1]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(8, 5)]} />
        <lineBasicMaterial color="#00ff00" transparent opacity={opacity} />
      </lineSegments>

      {/* Title */}
      <Text
        position={[0, 1.8, 0]}
        fontSize={0.6 * scale}
        color="#00ff00"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#003300"
        fillOpacity={opacity}
      >
        ✓ INTERCEPT SUCCESS
      </Text>

      {/* Stats Grid */}
      <group position={[0, 0.5, 0]} scale={scale}>
        {/* Altitude */}
        <Text
          position={[-3, 0.3, 0]}
          fontSize={0.35}
          color="#66ffff"
          anchorX="left"
          anchorY="middle"
          fillOpacity={opacity}
        >
          ALTITUDE:
        </Text>
        <Text
          position={[3, 0.3, 0]}
          fontSize={0.5}
          color="#00ffff"
          anchorX="right"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
          fillOpacity={opacity}
        >
          {stats.altitude} km
        </Text>

        {/* Impact Velocity */}
        <Text
          position={[-3, -0.4, 0]}
          fontSize={0.35}
          color="#66ffff"
          anchorX="left"
          anchorY="middle"
          fillOpacity={opacity}
        >
          VELOCITY:
        </Text>
        <Text
          position={[3, -0.4, 0]}
          fontSize={0.5}
          color="#00ffff"
          anchorX="right"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
          fillOpacity={opacity}
        >
          {stats.velocity} m/s
        </Text>

        {/* Flight Time */}
        <Text
          position={[-3, -1.1, 0]}
          fontSize={0.35}
          color="#66ffff"
          anchorX="left"
          anchorY="middle"
          fillOpacity={opacity}
        >
          TIME:
        </Text>
        <Text
          position={[3, -1.1, 0]}
          fontSize={0.5}
          color="#00ffff"
          anchorX="right"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
          fillOpacity={opacity}
        >
          {stats.flightTime}s
        </Text>

        {/* Distance */}
        <Text
          position={[-3, -1.8, 0]}
          fontSize={0.35}
          color="#66ffff"
          anchorX="left"
          anchorY="middle"
          fillOpacity={opacity}
        >
          PRECISION:
        </Text>
        <Text
          position={[3, -1.8, 0]}
          fontSize={0.5}
          color="#00ff00"
          anchorX="right"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
          fillOpacity={opacity}
        >
          {stats.distance}m
        </Text>
      </group>

      {/* Pulsing success indicator */}
      <mesh position={[0, 2.2, 0]}>
        <ringGeometry args={[0.3, 0.4, 32]} />
        <meshStandardMaterial
          color="#00ff00"
          emissive="#00ff00"
          emissiveIntensity={2 * opacity * (0.5 + Math.sin(Date.now() * 0.01) * 0.5)}
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Ambient glow */}
      <pointLight
        position={[0, 0, 1]}
        color="#00ff00"
        intensity={20 * opacity}
        distance={15}
      />

      {/* Success flash */}
      <pointLight
        position={[0, 0, 1]}
        color="#00ffff"
        intensity={10 * opacity * (0.5 + Math.sin(Date.now() * 0.02) * 0.5)}
        distance={10}
      />
    </group>
  )
}
