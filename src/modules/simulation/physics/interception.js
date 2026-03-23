// Algorithm 1: Numerical Interception from AM205 report
export function calculateOptimalInterceptPoint(domePos, missile, interceptorSpeed = 80) {
  if (!missile.projectedPath || missile.projectedPath.length < 4) {
    return calculateDirectIntercept(domePos, missile.position, missile.velocity, interceptorSpeed)
  }
  
  let bestPoint = missile.position
  let bestTime = Infinity
  
  const dt = 0.016
  
  for (let i = 0; i < missile.projectedPath.length; i++) {
    const projectedPos = missile.projectedPath[i]
    
    const dx = projectedPos[0] - domePos[0]
    const dy = projectedPos[1] - domePos[1]
    const dz = projectedPos[2] - domePos[2]
    const distance = Math.sqrt(dx*dx + dy*dy + dz*dz)
    
    const timeToReach = distance / interceptorSpeed
    const timeToProjectedPoint = i * dt
    
    if (Math.abs(timeToReach - timeToProjectedPoint) < bestTime) {
      bestTime = Math.abs(timeToReach - timeToProjectedPoint)
      bestPoint = projectedPos
    }
  }
  
  const dx = bestPoint[0] - domePos[0]
  const dy = bestPoint[1] - domePos[1]
  const dz = bestPoint[2] - domePos[2]
  const distance = Math.sqrt(dx*dx + dy*dy + dz*dz)
  
  return {
    velocity: [
      (dx / distance) * interceptorSpeed,
      (dy / distance) * interceptorSpeed,
      (dz / distance) * interceptorSpeed
    ],
    targetPoint: bestPoint,
    seekMode: true
  }
}

// Proportional Navigation Guidance for interceptors
export function calculateProportionalNavigation(interceptorPos, interceptorVel, targetPos, targetVel, N = 3) {
  const dx = targetPos[0] - interceptorPos[0]
  const dy = targetPos[1] - interceptorPos[1]
  const dz = targetPos[2] - interceptorPos[2]
  const range = Math.sqrt(dx*dx + dy*dy + dz*dz)
  
  if (range < 0.1) return interceptorVel
  
  const losX = dx / range
  const losY = dy / range
  const losZ = dz / range
  
  const relVelX = targetVel[0] - interceptorVel[0]
  const relVelY = targetVel[1] - interceptorVel[1]
  const relVelZ = targetVel[2] - interceptorVel[2]
  
  const closingRate = -(relVelX * losX + relVelY * losY + relVelZ * losZ)
  
  const losRateX = (relVelX - closingRate * losX) / range
  const losRateY = (relVelY - closingRate * losY) / range
  const losRateZ = (relVelZ - closingRate * losZ) / range
  
  const speed = Math.sqrt(interceptorVel[0]**2 + interceptorVel[1]**2 + interceptorVel[2]**2)
  
  const accelX = N * closingRate * losRateX
  const accelY = N * closingRate * losRateY
  const accelZ = N * closingRate * losRateZ
  
  const newVelX = interceptorVel[0] + accelX * 0.016
  const newVelY = interceptorVel[1] + accelY * 0.016
  const newVelZ = interceptorVel[2] + accelZ * 0.016
  
  const newSpeed = Math.sqrt(newVelX**2 + newVelY**2 + newVelZ**2)
  
  return [
    (newVelX / newSpeed) * speed,
    (newVelY / newSpeed) * speed,
    (newVelZ / newSpeed) * speed
  ]
}

function calculateDirectIntercept(domePos, missilePos, missileVel, interceptorSpeed) {
  const dx = missilePos[0] - domePos[0]
  const dy = missilePos[1] - domePos[1]
  const dz = missilePos[2] - domePos[2]
  const distance = Math.sqrt(dx*dx + dy*dy + dz*dz)
  
  return {
    velocity: [
      (dx / distance) * interceptorSpeed,
      (dy / distance) * interceptorSpeed,
      (dz / distance) * interceptorSpeed
    ],
    targetPoint: missilePos,
    seekMode: true
  }
}



