import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function RadarPing({ position, radius, color = '#00ff00', speed = 2 }) {
  const ringRef = useRef()
  const timeRef = useRef(0)
  
  useFrame((state, delta) => {
    timeRef.current += delta * speed
    
    if (ringRef.current) {
      const scale = (timeRef.current % 2) / 2 // 0 to 1
      ringRef.current.scale.set(scale, scale, scale)
      ringRef.current.material.opacity = 1 - scale
      
      if (scale > 0.95) {
        timeRef.current = 0
      }
    }
  })
  
  return (
    <mesh ref={ringRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius * 0.95, radius, 64]} />
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={1}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export function RadarScanBeam({ position, radius, rotationSpeed = 0.5 }) {
  const beamRef = useRef()
  
  useFrame((state, delta) => {
    if (beamRef.current) {
      beamRef.current.rotation.z += delta * rotationSpeed
    }
  })
  
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.lineTo(radius, 0)
    shape.arc(0, 0, radius, 0, Math.PI / 12, false)
    shape.lineTo(0, 0)
    
    return new THREE.ShapeGeometry(shape)
  }, [radius])
  
  return (
    <mesh 
      ref={beamRef} 
      position={[position[0], 0.1, position[2]]} 
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <primitive object={geometry} />
      <meshBasicMaterial 
        color="#00ff00" 
        transparent 
        opacity={0.15}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}