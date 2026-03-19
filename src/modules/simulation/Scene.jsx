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
        position={[60, 40, 60]}
        fov={50}
      />
      
      <OrbitControls />
      
      <ambientLight intensity={0.3} />
      <directionalLight position={[50, 50, 25]} intensity={1.0} castShadow />
      
      {/* Black sky */}
      <color attach="background" args={['#000000']} />
      
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
      
      {/* Iron Dome System */}
      <IronDome />
      <DetectionRadius />
      
      {/* Entities */}
      <Jet />
      <Missiles />
      <Interceptors />
      
      {/* Physics Engine */}
      <SimulationEngine />
    </>
  )
}

