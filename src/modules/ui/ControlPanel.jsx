import { useSimStore } from '../../store/simStore'
export default function ControlPanel(){
 const toggle = useSimStore(s=>s.toggle)
 return (<div>
  <h3>Simulation</h3>
  <button onClick={toggle}>Play/Pause</button>
 </div>)
}
