export function projectTrajectory(position, velocity, gravity, drag, steps = 60, dt = 0.016) {
  const projected = []
  let pos = [...position]
  let vel = [...velocity]
  
  for (let i = 0; i < steps; i++) {
    // Apply gravity
    vel[1] -= gravity * dt
    
    // Apply drag
    const speed = Math.sqrt(vel[0]**2 + vel[1]**2 + vel[2]**2)
    const dragForce = drag * speed
    vel = vel.map(v => v * (1 - dragForce * dt))
    
    // Update position
    pos = pos.map((p, i) => p + vel[i] * dt)
    
    projected.push([...pos])
    
    // Stop if hits ground
    if (pos[1] <= 0) break
  }
  
  return projected
}
