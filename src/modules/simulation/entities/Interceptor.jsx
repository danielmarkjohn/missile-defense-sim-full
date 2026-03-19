import { useRef } from 'react'
import { useSimStore } from '../../../store/simStore'

export default function Interceptor(){
 const ref = useRef()
 const pos = useSimStore(s=>s.interceptor.position)
 if(ref.current) ref.current.position.set(...pos)
 return <mesh ref={ref}><sphereGeometry args={[0.2,16,16]}/><meshStandardMaterial color="blue"/></mesh>
}
