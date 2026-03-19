import { projectTrajectory } from './projection'

const GRAVITY = -9.81
const DRAG_COEFFICIENT = 0.01

export function updateMissile(missile, dt, gravity = 9.8, drag = 0.01) {
  const newVel = [...missile.velocity]
  
  // Apply gravity
  newVel[1] -= gravity * dt
  
  // Apply drag
  const speed = Math.sqrt(newVel[0]**2 + newVel[1]**2 + newVel[2]**2)
  const dragForce = drag * speed
  newVel[0] *= (1 - dragForce * dt)
  newVel[1] *= (1 - dragForce * dt)
  newVel[2] *= (1 - dragForce * dt)
  
  const newPos = missile.position.map((p, i) => p + newVel[i] * dt)
  
  // Check if hit ground
  if (newPos[1] <= 0) {
    return { ...missile, active: false }
  }
  
  return {
    ...missile,
    position: newPos,
    velocity: newVel
  }
}

export function updateInterceptor(interceptor, dt, missiles) {
  const newPos = interceptor.position.map((p, i) => p + interceptor.velocity[i] * dt)
  
  // Check if hit ground
  if (newPos[1] <= 0) {
    return { ...interceptor, active: false }
  }
  
  // Check if reached target point
  if (interceptor.targetPoint) {
    const dx = newPos[0] - interceptor.targetPoint[0]
    const dy = newPos[1] - interceptor.targetPoint[1]
    const dz = newPos[2] - interceptor.targetPoint[2]
    const distance = Math.sqrt(dx*dx + dy*dy + dz*dz)
    
    if (distance < 1) {
      return { ...interceptor, active: false }
    }
  }
  
  return {
    ...interceptor,
    position: newPos
  }
}

export function calculateInterceptPath(domePos, missilePos, missileVel) {
  const interceptSpeed = 50
  
  const dx = missilePos[0] - domePos[0]
  const dy = missilePos[1] - domePos[1]
  const dz = missilePos[2] - domePos[2]
  const distance = Math.sqrt(dx*dx + dy*dy + dz*dz)
  
  return {
    velocity: [
      (dx / distance) * interceptSpeed,
      (dy / distance) * interceptSpeed,
      (dz / distance) * interceptSpeed
    ]
  }
}

export function update(entity, dt) {
  const newVelocity = [...entity.velocity]
  newVelocity[1] += GRAVITY * dt
  
  const newPosition = entity.position.map((p, i) => p + newVelocity[i] * dt)
  
  return {
    ...entity,
    position: newPosition,
    velocity: newVelocity
  }
}




