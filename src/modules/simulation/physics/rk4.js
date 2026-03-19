export function rk4(state, dt, accFn){
 const a1 = accFn(state)
 const v1 = state.velocity

 const s2 = {
  position: state.position.map((p,i)=> p + v1[i]*dt/2),
  velocity: state.velocity.map((v,i)=> v + a1[i]*dt/2)
 }
 const a2 = accFn(s2)

 const s3 = {
  position: state.position.map((p,i)=> p + s2.velocity[i]*dt/2),
  velocity: state.velocity.map((v,i)=> v + a2[i]*dt/2)
 }
 const a3 = accFn(s3)

 const s4 = {
  position: state.position.map((p,i)=> p + s3.velocity[i]*dt),
  velocity: state.velocity.map((v,i)=> v + a3[i]*dt)
 }
 const a4 = accFn(s4)

 return {
  position: state.position.map((p,i)=> p + (dt/6)*(v1[i] + 2*s2.velocity[i] + 2*s3.velocity[i] + s4.velocity[i])),
  velocity: state.velocity.map((v,i)=> v + (dt/6)*(a1[i] + 2*a2[i] + 2*a3[i] + a4[i]))
 }
}
