import { useRef, useEffect, useState } from 'react'
import { useSimStore } from '../../../store/simStore'
import { Trail } from '@react-three/drei'
import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'

// Shared model loader - load once and reuse
let missileModel = null
let isLoading = false
let loadCallbacks = []

function loadMissileModel(callback) {
  if (missileModel) {
    callback(missileModel)
    return
  }

  loadCallbacks.push(callback)

  if (isLoading) return
  isLoading = true

  console.log('Loading missile model...')
  const mtlLoader = new MTLLoader()
  mtlLoader.setPath('/models/')
  mtlLoader.load('AVMT300.mtl', (materials) => {
    console.log('Missile MTL loaded successfully', materials)
    materials.preload()

    const objLoader = new OBJLoader()
    objLoader.setMaterials(materials)
    objLoader.setPath('/models/')
    objLoader.load('AVMT300.obj', (obj) => {
      console.log('Missile OBJ loaded successfully')

      // Enhance materials with better lighting properties
      obj.traverse((child) => {
        if (child.isMesh) {
          if (child.material) {
            // Keep the texture from MTL but enhance lighting
            child.material.metalness = 0.7
            child.material.roughness = 0.3
            child.material.emissive = new THREE.Color(0x220000) // Slight red glow
            child.material.emissiveIntensity = 0.3
            child.material.needsUpdate = true
          }
        }
      })

      missileModel = obj
      loadCallbacks.forEach(cb => cb(obj))
      loadCallbacks = []
    },
    undefined,
    (error) => {
      console.error('Error loading missile OBJ:', error)
      loadCallbacks.forEach(cb => cb(null))
      loadCallbacks = []
    })
  },
  undefined,
  (error) => {
    console.error('Error loading missile MTL:', error)
    loadCallbacks.forEach(cb => cb(null))
    loadCallbacks = []
  })
}

function Missile({ missile }) {
  const ref = useRef()
  const exhaustRef = useRef()
  const [flickerIntensity, setFlickerIntensity] = useState(1)
  const [model, setModel] = useState(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    loadMissileModel((loadedModel) => {
      if (loadedModel) {
        setModel(loadedModel)
      } else {
        setLoadError(true)
      }
    })
  }, [])

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

      if (speed > 0.1) {
        // Create direction vector from velocity
        const direction = new THREE.Vector3(vx, vy, vz).normalize()
        
        // Calculate rotation to align missile with velocity
        // The model's default forward is +Y, we need to align it with the velocity vector
        const up = new THREE.Vector3(0, 1, 0)
        const quaternion = new THREE.Quaternion()
        quaternion.setFromUnitVectors(up, direction)
        
        ref.current.quaternion.copy(quaternion)
        
        // Add slight roll based on horizontal velocity for realism
        const horizontalSpeed = Math.sqrt(vx*vx + vz*vz)
        if (horizontalSpeed > 0.1) {
          ref.current.rotateOnAxis(direction, speed * 0.005)
        }
      }
    }

    // Animate exhaust particles
    if (exhaustRef.current) {
      exhaustRef.current.rotation.z += 0.3
      exhaustRef.current.scale.setScalar(0.8 + Math.sin(Date.now() * 0.01) * 0.2)
    }
  }, [missile.position, missile.velocity])

  // Fallback to simple geometry if model fails to load or is still loading
  if (loadError || !model) {
    return (
      <Trail
        width={2.5}
        length={20}
        color="#ff6644"
        attenuation={(t) => t * t * t}
        decay={1}
      >
        <group ref={ref}>
          {/* Main warhead - SMALLER SIZE */}
          <mesh castShadow>
            <coneGeometry args={[0.3, 1.5, 12]} />
            <meshStandardMaterial
              color="#cc0000"
              emissive="#ff0000"
              emissiveIntensity={1.5}
              metalness={0.6}
              roughness={0.3}
            />
          </mesh>

          {/* Body */}
          <mesh position={[0, -1.0, 0]} castShadow>
            <cylinderGeometry args={[0.25, 0.25, 1.0, 12]} />
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
                Math.cos(angle * Math.PI / 180) * 0.25,
                -1.4,
                Math.sin(angle * Math.PI / 180) * 0.25
              ]}
              rotation={[0, angle * Math.PI / 180, 0]}
              castShadow
            >
              <boxGeometry args={[0.05, 0.6, 0.4]} />
              <meshStandardMaterial color="#666" metalness={0.8} />
            </mesh>
          ))}

          {/* Rocket exhaust glow - SMALLER */}
          <mesh position={[0, -1.8, 0]}>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial
              color="#ff4400"
              emissive="#ff6600"
              emissiveIntensity={2.5 * flickerIntensity}
              transparent
              opacity={0.7}
            />
          </mesh>

          {/* Exhaust particles */}
          <group ref={exhaustRef} position={[0, -2.2, 0]}>
            {[...Array(6)].map((_, i) => (
              <mesh
                key={i}
                position={[
                  Math.cos(i * Math.PI / 3) * 0.25,
                  -Math.random() * 0.3,
                  Math.sin(i * Math.PI / 3) * 0.25
                ]}
              >
                <sphereGeometry args={[0.08, 8, 8]} />
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
            position={[0, -1.5, 0]}
            color="#ff4400"
            intensity={60 * flickerIntensity}
            distance={20}
            decay={2}
          />

          {/* Warning strobe light */}
          <pointLight
            position={[0, 0.5, 0]}
            color="#ff0000"
            intensity={Math.sin(Date.now() * 0.02) > 0 ? 15 : 0}
            distance={10}
          />
        </group>
      </Trail>
    )
  }

  // Render with 3D model - FIXED ORIENTATION
  return (
    <Trail
      width={2.5}
      length={20}
      color="#ff6644"
      attenuation={(t) => t * t * t}
      decay={1}
    >
      <group ref={ref}>
        {/* 3D Missile Model - Properly oriented */}
        <primitive 
          object={model.clone()} 
          scale={0.25}
        />

        {/* Rocket exhaust glow */}
        <mesh position={[0, -1.8, 0]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial
            color="#ff4400"
            emissive="#ff6600"
            emissiveIntensity={2.5 * flickerIntensity}
            transparent
            opacity={0.7}
          />
        </mesh>

        {/* Exhaust particles */}
        <group ref={exhaustRef} position={[0, -2.2, 0]}>
          {[...Array(6)].map((_, i) => (
            <mesh
              key={i}
              position={[
                Math.cos(i * Math.PI / 3) * 0.25,
                -Math.random() * 0.3,
                Math.sin(i * Math.PI / 3) * 0.25
              ]}
            >
              <sphereGeometry args={[0.08, 8, 8]} />
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

        {/* Main light source - RED for air-to-ground */}
        <pointLight
          position={[0, -1.5, 0]}
          color="#ff4400"
          intensity={60 * flickerIntensity}
          distance={20}
          decay={2}
        />

        {/* Warning strobe light - RED */}
        <pointLight
          position={[0, 0.5, 0]}
          color="#ff0000"
          intensity={Math.sin(Date.now() * 0.02) > 0 ? 15 : 0}
          distance={10}
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


