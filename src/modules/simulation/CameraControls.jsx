import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import CameraControls from 'camera-controls'
import * as THREE from 'three'

// Install camera-controls
CameraControls.install({ THREE })

export function CameraControlsComponent() {
  const { camera, gl } = useThree()
  const controlsRef = useRef()

  useEffect(() => {
    const controls = new CameraControls(camera, gl.domElement)
    
    // Configure for tactical view
    controls.minDistance = 20
    controls.maxDistance = 200
    controls.minPolarAngle = 0
    controls.maxPolarAngle = Math.PI / 2.2 // Prevent going below ground
    
    // Smooth camera movement
    controls.smoothTime = 0.25
    controls.draggingSmoothTime = 0.125
    
    controlsRef.current = controls
    
    return () => controls.dispose()
  }, [camera, gl])

  useFrame((_, delta) => {
    controlsRef.current?.update(delta)
  })

  return null
}