export function projectTrajectory(position, velocity, gravity, timeHorizon, dt) {
  const path = []
  let pos = [...position]
  let vel = [...velocity]
  
  const steps = Math.floor(timeHorizon / dt)
  
  for (let i = 0; i < steps; i++) {
    vel[1] -= gravity * dt
    
    pos = [
      pos[0] + vel[0] * dt,
      pos[1] + vel[1] * dt,
      pos[2] + vel[2] * dt
    ]
    
    if (pos[1] < 0) break
    
    path.push([...pos])
  }
  
  return path
}