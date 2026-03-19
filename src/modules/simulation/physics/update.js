import { projectTrajectory } from './projection'
import { calculateProportionalNavigation } from './interception'

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
  const targetMissile = missiles.find(m => m.id === interceptor.targetId && m.active)
  
  if (!targetMissile) {
    return { ...interceptor, active: false }
  }
  
  // Apply proportional navigation guidance
  const newVel = calculateProportionalNavigation(
    interceptor.position,
    interceptor.velocity,
    targetMissile.position,
    targetMissile.velocity,
    4 // Navigation constant
  )
  
  // Apply gravity
  newVel[1] -= 9.8 * dt * 0.3 // Reduced gravity for powered flight
  
  const newPos = interceptor.position.map((p, i) => p + newVel[i] * dt)
  
  // Check if hit ground
  if (newPos[1] <= 0) {
    return { ...interceptor, active: false }
  }
  
  // Check collision with target
  const dx = newPos[0] - targetMissile.position[0]
  const dy = newPos[1] - targetMissile.position[1]
  const dz = newPos[2] - targetMissile.position[2]
  const distance = Math.sqrt(dx*dx + dy*dy + dz*dz)
  
  if (distance < 2) {
    return { 
      ...interceptor, 
      active: false, 
      exploded: true,
      explosionPos: newPos,
      explosionTime: Date.now()
    }
  }
  
  return {
    ...interceptor,
    position: newPos,
    velocity: newVel
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






