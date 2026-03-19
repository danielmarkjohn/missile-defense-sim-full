import { useRef } from 'react'
import { useSimStore } from '../../../store/simStore'

export default function Missile(){
 const ref = useRef()
 const pos = useSimStore(s=>s.missile.position)
 if(ref.current) ref.current.position.set(...pos)
 return <mesh ref={ref}><sphereGeometry args={[0.3,16,16]}/><meshStandardMaterial color="red"/></mesh>
}
