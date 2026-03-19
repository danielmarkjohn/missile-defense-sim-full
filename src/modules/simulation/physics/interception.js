// Algorithm 1: Numerical Interception from AM205 report
export function calculateOptimalInterceptPoint(domePos, missile, interceptorSpeed = 60) {
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
    targetPoint: bestPoint
  }
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
    targetPoint: missilePos
  }
}


