import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { useSimStore } from '../../store/simStore'
import Jet from './entities/Jet'
import Missiles from './entities/Missiles'
import Interceptors from './entities/Interceptors'
import IronDome from './entities/IronDome'
import DetectionRadius from './entities/DetectionRadius'
import SimulationEngine from './SimulationEngine'

export default function Scene() {
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[100, 80, 100]}
        fov={90}
      />

      <OrbitControls />
      
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[50, 50, 25]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <hemisphereLight intensity={0.3} groundColor="#001100" />

      <fog attach="fog" args={['#000000', 100, 300]} />
      <color attach="background" args={['#000000']} />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[600, 600]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>

      <gridHelper args={[600, 120, '#00ff00', '#003300']} position={[0, 0.05, 0]} />

      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[600, 600]} />
        <meshBasicMaterial 
          color="#001100" 
          transparent 
          opacity={0.1}
          side={2}
        />
      </mesh>

      <mesh position={[0, 60, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[600, 120]} />
        <meshBasicMaterial 
          color="#001100" 
          transparent 
          opacity={0.05}
          wireframe
          side={2}
        />
      </mesh>

      <mesh position={[0, 60, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[600, 120]} />
        <meshBasicMaterial 
          color="#001100" 
          transparent 
          opacity={0.05}
          wireframe
          side={2}
        />
      </mesh>

      <IronDome />
      <DetectionRadius />
      
      <Jet />
      <Missiles />
      <Interceptors />
      
      <SimulationEngine />
    </>
  )
}

