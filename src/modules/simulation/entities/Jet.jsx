import { useRef, useEffect, useState } from 'react'
import { useSimStore } from '../../../store/simStore'
import { Trail } from '@react-three/drei'
import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'

export default function Jet() {
  const jet = useSimStore(s => s.jet)
  const meshRef = useRef()
  const [model, setModel] = useState(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    console.log('Loading jet model...')
    const mtlLoader = new MTLLoader()
    mtlLoader.setPath('/models/')
    mtlLoader.load('jetanima.mtl', (materials) => {
      console.log('MTL loaded successfully', materials)
      materials.preload()

      const objLoader = new OBJLoader()
      objLoader.setMaterials(materials)
      objLoader.setPath('/models/')
      objLoader.load('jetanima.obj', (obj) => {
        console.log('OBJ loaded successfully')
        // Enhance materials with better lighting properties
        obj.traverse((child) => {
          if (child.isMesh) {
            if (child.material) {
              // Keep the material from MTL but enhance it
              child.material.metalness = 0.6
              child.material.roughness = 0.4
              child.material.needsUpdate = true
            }
          }
        })
        setModel(obj)
      },
      (progress) => {
        console.log('Loading OBJ:', (progress.loaded / progress.total * 100).toFixed(2) + '%')
      },
      (error) => {
        console.error('Error loading OBJ:', error)
        setLoadError(true)
      })
    },
    (progress) => {
      console.log('Loading MTL:', (progress.loaded / progress.total * 100).toFixed(2) + '%')
    },
    (error) => {
      console.error('Error loading MTL:', error)
      setLoadError(true)
    })
  }, [])

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...jet.position)

      if (jet.active) {
        const direction = new THREE.Vector3(...jet.velocity).normalize()
        const forward = new THREE.Vector3(1, 0, 0) // Jet points in +X direction
        meshRef.current.quaternion.setFromUnitVectors(forward, direction)
      }
    }
  }, [jet.position, jet.velocity, jet.active])

  if (!jet.active) return null

  // Fallback to simple geometry if model fails to load
  if (loadError || !model) {
    return (
      <Trail
        width={8}
        length={30}
        color="#ffffff"
        attenuation={(t) => t * t}
        decay={1}
      >
        <group ref={meshRef}>
          {/* Fallback jet shape - much larger */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[3, 12, 8]} />
            <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.3} emissive="#444444" />
          </mesh>
          <mesh position={[-4, 0, 3]}>
            <boxGeometry args={[6, 0.3, 5]} />
            <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[-4, 0, -3]}>
            <boxGeometry args={[6, 0.3, 5]} />
            <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Tail */}
          <mesh position={[-6, 2, 0]}>
            <boxGeometry args={[2, 3, 0.3]} />
            <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} />
          </mesh>

          <pointLight position={[6, 0, 3]} color="#ff0000" intensity={20} distance={25} />
          <pointLight position={[6, 0, -3]} color="#00ff00" intensity={20} distance={25} />
          <pointLight position={[-8, 0, 0]} color="#ff6600" intensity={50} distance={50} />
          <pointLight position={[6, 0, 0]} color="#ffffff" intensity={15} distance={20} />
        </group>
      </Trail>
    )
  }

  return (
    <Trail
      width={8}
      length={30}
      color="#ffffff"
      attenuation={(t) => t * t}
      decay={1}
    >
      <group ref={meshRef}>
        <group rotation={[0, Math.PI / 2, 0]}>
          <primitive object={model.clone()} scale={5} />
        </group>

        <pointLight position={[6, 0, 3]} color="#ff0000" intensity={20} distance={25} />
        <pointLight position={[6, 0, -3]} color="#00ff00" intensity={20} distance={25} />
        <pointLight position={[-8, 0, 0]} color="#ff6600" intensity={50} distance={50} />
        <pointLight position={[6, 0, 0]} color="#ffffff" intensity={15} distance={20} />
      </group>
    </Trail>
  )
}



