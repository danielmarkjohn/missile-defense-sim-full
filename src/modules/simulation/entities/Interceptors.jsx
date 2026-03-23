import { useRef, useState, useEffect } from 'react'
import { useSimStore } from '../../../store/simStore'
import { TrackingLine } from '../components/TrackingLine'
import { Trail } from '@react-three/drei'
import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { Explosion } from '../components/Explosion'
import { ImpactStats } from '../components/ImpactStats'

// Shared model loader - reuse the same missile model
let interceptorModel = null
let isLoading = false
let loadCallbacks = []

function loadInterceptorModel(callback) {
  if (interceptorModel) {
    callback(interceptorModel)
    return
  }

  loadCallbacks.push(callback)

  if (isLoading) return
  isLoading = true

  const mtlLoader = new MTLLoader()
  mtlLoader.setPath('/models/')
  mtlLoader.load('AVMT300.mtl', (materials) => {
    materials.preload()

    const objLoader = new OBJLoader()
    objLoader.setMaterials(materials)
    objLoader.setPath('/models/')
    objLoader.load('AVMT300.obj', (obj) => {
      // Enhance materials for interceptor (blue theme)
      obj.traverse((child) => {
        if (child.isMesh) {
          if (child.material) {
            child.material.metalness = 0.7
            child.material.roughness = 0.3
            child.material.emissive = new THREE.Color(0x000022) // Blue glow
            child.material.emissiveIntensity = 0.3
            child.material.needsUpdate = true
          }
        }
      })

      interceptorModel = obj
      loadCallbacks.forEach(cb => cb(obj))
      loadCallbacks = []
    })
  })
}

function InterceptorMissile({ interceptor }) {
  const ref = useRef()
  const exhaustRef = useRef()
  const [flickerIntensity, setFlickerIntensity] = useState(1)
  const [model, setModel] = useState(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    loadInterceptorModel((loadedModel) => {
      if (loadedModel) {
        setModel(loadedModel)
      } else {
        setLoadError(true)
      }
    })
  }, [])
  
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
      
      if (speed > 0.1) {
        // Create direction vector from velocity
        const direction = new THREE.Vector3(vx, vy, vz).normalize()
        
        // Calculate rotation to align interceptor with velocity
        const up = new THREE.Vector3(0, 1, 0)
        const quaternion = new THREE.Quaternion()
        quaternion.setFromUnitVectors(up, direction)
        
        ref.current.quaternion.copy(quaternion)
        
        // Add slight roll for realism
        const horizontalSpeed = Math.sqrt(vx*vx + vz*vz)
        if (horizontalSpeed > 0.1) {
          ref.current.rotateOnAxis(direction, speed * 0.005)
        }
      }
    }
    
    if (exhaustRef.current) {
      exhaustRef.current.rotation.z += 0.3
      const boostScale = (interceptor.speedMultiplier || 1) * 0.5
      exhaustRef.current.scale.setScalar(boostScale + Math.sin(Date.now() * 0.01) * 0.2)
    }
  }, [interceptor.position, interceptor.velocity, interceptor.speedMultiplier])
  
  const speedMultiplier = interceptor.speedMultiplier || 1
  const isBoosting = speedMultiplier > 1.5
  
  // Render with 3D model
  if (model) {
    return (
      <Trail
        width={isBoosting ? 3.5 : 2}
        length={isBoosting ? 25 : 15}
        color={isBoosting ? "#00ffff" : "#00ddff"}
        attenuation={(t) => t * t * t}
        decay={1}
      >
        <group ref={ref}>
          {/* 3D Interceptor Model - Same as missile */}
          <primitive 
            object={model.clone()} 
            scale={0.25}
          />

          {/* Rocket exhaust glow - BLUE */}
          <mesh position={[0, -1.8, 0]}>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial
              color={isBoosting ? "#00ffff" : "#0088ff"}
              emissive={isBoosting ? "#00ffff" : "#0099ff"}
              emissiveIntensity={2.5 * flickerIntensity}
              transparent
              opacity={0.7}
            />
          </mesh>

          {/* Exhaust particles - BLUE */}
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
                  color="#00aaff"
                  emissive="#0099ff"
                  emissiveIntensity={flickerIntensity * 2}
                  transparent
                  opacity={0.6}
                />
              </mesh>
            ))}
          </group>

          {/* Main light source - BLUE for ground-to-air */}
          <pointLight
            position={[0, -1.5, 0]}
            color={isBoosting ? "#00ffff" : "#0088ff"}
            intensity={60 * flickerIntensity}
            distance={20}
            decay={2}
          />

          {/* Warning strobe light - BLUE */}
          <pointLight
            position={[0, 0.5, 0]}
            color="#00ddff"
            intensity={Math.sin(Date.now() * 0.02) > 0 ? 15 : 0}
            distance={10}
          />
        </group>
      </Trail>
    )
  }
  
  // Fallback geometry if model not loaded
  return (
    <Trail
      width={isBoosting ? 3.5 : 2}
      length={isBoosting ? 25 : 15}
      color={isBoosting ? "#00ffff" : "#00ddff"}
      attenuation={(t) => t * t * t}
      decay={1}
    >
      <group ref={ref}>
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
        
        <mesh position={[0, -2, 0]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 1.5, 12]} />
          <meshStandardMaterial 
            color="#003366" 
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>

        <mesh position={[0, -3.5, 0]}>
          <sphereGeometry args={[isBoosting ? 0.6 : 0.4, 16, 16]} />
          <meshStandardMaterial
            color={isBoosting ? "#00ffff" : "#0088ff"}
            emissive={isBoosting ? "#00ffff" : "#0099ff"}
            emissiveIntensity={2.5 * flickerIntensity}
            transparent
            opacity={0.7}
          />
        </mesh>

        <group ref={exhaustRef} position={[0, -4, 0]}>
          {[...Array(8)].map((_, i) => (
            <mesh
              key={i}
              position={[
                Math.cos(i * Math.PI / 4) * 0.3,
                -Math.random() * 0.4,
                Math.sin(i * Math.PI / 4) * 0.3
              ]}
            >
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial
                color="#00aaff"
                emissive="#0099ff"
                emissiveIntensity={flickerIntensity * 2}
                transparent
                opacity={0.6}
              />
            </mesh>
          ))}
        </group>

        <pointLight
          position={[0, -3, 0]}
          color={isBoosting ? "#00ffff" : "#0088ff"}
          intensity={80 * flickerIntensity}
          distance={25}
          decay={2}
        />

        <pointLight
          position={[0, 1, 0]}
          color="#00ddff"
          intensity={Math.sin(Date.now() * 0.02) > 0 ? 20 : 0}
          distance={12}
        />
      </group>
    </Trail>
  )
}

export default function Interceptors() {
  const interceptors = useSimStore(s => s.interceptors)
  const missiles = useSimStore(s => s.missiles)
  const [explosions, setExplosions] = useState([])
  const [impactStats, setImpactStats] = useState([])

  // Optimized explosion tracking - prevent memory leaks
  useEffect(() => {
    const explodedInterceptors = interceptors.filter(i => i.exploded && i.explosionTime)
    
    explodedInterceptors.forEach(interceptor => {
      const existingExplosion = explosions.find(e => e.interceptorId === interceptor.id)
      if (!existingExplosion && interceptor.explosionPos) {
        setExplosions(prev => [...prev, {
          id: `exp-${interceptor.id}-${Date.now()}`,
          interceptorId: interceptor.id,
          position: interceptor.explosionPos,
          time: interceptor.explosionTime
        }])
        
        if (interceptor.impactStats) {
          setImpactStats(prev => [...prev, {
            id: `stats-${interceptor.id}-${Date.now()}`,
            interceptorId: interceptor.id,
            position: interceptor.explosionPos,
            stats: interceptor.impactStats,
            time: interceptor.explosionTime
          }])
        }
      }
    })
    
    // Auto-cleanup old explosions after 2 seconds
    const now = Date.now()
    setExplosions(prev => prev.filter(e => (now - e.time) < 2000))
    setImpactStats(prev => prev.filter(s => (now - s.time) < 3500))
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
      
      {impactStats.map(stat => (
        <ImpactStats
          key={stat.id}
          position={stat.position}
          stats={stat.stats}
          onComplete={() => setImpactStats(prev => prev.filter(s => s.id !== stat.id))}
        />
      ))}
    </>
  )
}
