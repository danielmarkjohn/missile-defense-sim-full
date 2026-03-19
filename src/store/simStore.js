import { create } from 'zustand'
import { updateMissile, updateInterceptor, calculateInterceptPath } from '../modules/simulation/physics/update'
import { projectTrajectory } from '../modules/simulation/physics/projection'
import { calculateOptimalInterceptPoint } from '../modules/simulation/physics/interception'
import { KalmanFilter } from '../modules/simulation/physics/kalman'

export const useSimStore = create((set, get) => ({
  running: false,
  timeScale: 1.0, // Increased from 0.3 for better performance

  constants: {
    gravity: 9.8, // m/s²
    metersToKm: 0.001,
    kmToMeters: 1000,
    missileTerminalVelocity: 800, // m/s (Mach 2.3)
    interceptorMaxSpeed: 1200, // m/s (Mach 3.5)
    radarUpdateRate: 0.1, // seconds (10 Hz)
    guidanceUpdateRate: 0.05 // seconds (20 Hz)
  },

  ironDome: {
    position: [0, 0, 0],
    detectionRadius: 120, // Increased from 70 to 120 km (scaled for visibility)
    maxInterceptors: 20,
    interceptorSpeed: 250, // Increased from 180 to 250 m/s for faster response
    radarRange: 150,
    trackingAccuracy: 0.95
  },

  jet: {
    position: [-80, 8, -40], // scaled coordinates
    velocity: [25, 0, 12.5], // scaled velocity
    active: false,
    speed: 25, // scaled speed
    altitude: 50 // scaled altitude - increased to 50km
  },

  missiles: [],
  interceptors: [],
  
  start: () => set({ running: true }),
  pause: () => set({ running: false }),
  
  reset: () => set({
    running: false,
    jet: {
      position: [-80, 50, -40],
      velocity: [25, 0, 12.5],
      active: false,
      speed: 25,
      altitude: 50,
      lastMissileRelease: 0,
      missileCount: 0
    },
    missiles: [],
    interceptors: []
  }),
  
  launchJet: () => {
    console.log('🚀 Launching jet...')
    const state = get()
    set({
      jet: { 
        ...state.jet, 
        active: true,
        position: [-80, state.jet.altitude, -40],
        velocity: [state.jet.speed, 0, state.jet.speed * 0.5],
        lastMissileRelease: 0,
        missileCount: 0
      },
      running: true
    })
  },
  
  releaseMissile: () => {
    const state = get()
    if (!state.jet.active) return
    
    // Smart attack patterns - climb then dive
    const attackPatterns = [
      { vx: 0, vz: 0, vy: 5, phase: 'climb' }, // Climb first
      { vx: -8, vz: 6, vy: 3, phase: 'climb' },
      { vx: 8, vz: 6, vy: 3, phase: 'climb' },
      { vx: 5, vz: 5, vy: 4, phase: 'climb' },
      { vx: 6, vz: 6, vy: 2, phase: 'climb' }
    ]
    
    const pattern = attackPatterns[Math.floor(Math.random() * attackPatterns.length)]
    const speedVariation = 0.8 + Math.random() * 0.4
    const timestamp = Date.now()
    
    const newMissile = {
      id: timestamp + Math.random(),
      position: [state.jet.position[0], state.jet.position[1], state.jet.position[2]],
      velocity: [
        pattern.vx * speedVariation,
        pattern.vy * speedVariation,
        pattern.vz * speedVariation
      ],
      active: true,
      positionHistory: [],
      projectedPath: [],
      kalmanFilter: new KalmanFilter(),
      phase: 'climb',
      apexReached: false,
      targetPos: [0, 0, 0]
    }
    
    set(state => ({
      missiles: [...state.missiles, newMissile]
    }))
  },
  
  step: (dt) => {
    const state = get()
    if (!state.running) return
    
    const scaledDt = dt * state.timeScale
    
    // Auto-release missiles from jet (intelligent timing)
    if (state.jet.active) {
      const currentTime = Date.now()
      const timeSinceLastRelease = currentTime - (state.jet.lastMissileRelease || 0)
      const missileInterval = 2000 + Math.random() * 1500 // 2-3.5 seconds between missiles
      const maxMissiles = 8 // Maximum missiles per jet run
      
      if (timeSinceLastRelease > missileInterval && state.jet.missileCount < maxMissiles) {
        // Smart attack patterns - climb then dive
        const attackPatterns = [
          { vx: 0, vz: 0, vy: 5, phase: 'climb' },
          { vx: -8, vz: 6, vy: 3, phase: 'climb' },
          { vx: 8, vz: 6, vy: 3, phase: 'climb' },
          { vx: 5, vz: 5, vy: 4, phase: 'climb' },
          { vx: 6, vz: 6, vy: 2, phase: 'climb' }
        ]
        
        const pattern = attackPatterns[Math.floor(Math.random() * attackPatterns.length)]
        const speedVariation = 0.8 + Math.random() * 0.4
        const timestamp = Date.now()
        
        const newMissile = {
          id: timestamp + Math.random(),
          position: [state.jet.position[0], state.jet.position[1], state.jet.position[2]],
          velocity: [
            pattern.vx * speedVariation,
            pattern.vy * speedVariation,
            pattern.vz * speedVariation
          ],
          active: true,
          positionHistory: [],
          projectedPath: [],
          kalmanFilter: new KalmanFilter(),
          phase: 'climb',
          apexReached: false,
          targetPos: [0, 0, 0]
        }
        
        set(state => ({
          missiles: [...state.missiles, newMissile],
          jet: {
            ...state.jet,
            lastMissileRelease: currentTime,
            missileCount: state.jet.missileCount + 1
          }
        }))
        
        console.log(`🚀 Auto-released missile ${state.jet.missileCount + 1}/${maxMissiles}`)
      }
    }
    
    // Pre-allocate arrays
    const updatedMissiles = new Array(state.missiles.length)
    const updatedInterceptors = new Array(state.interceptors.length)
    const newInterceptors = []
    
    // Update jet
    let updatedJet = state.jet
    if (updatedJet.active) {
      const pos = updatedJet.position
      updatedJet = {
        ...updatedJet,
        position: [
          pos[0] + updatedJet.velocity[0] * scaledDt,
          pos[1] + updatedJet.velocity[1] * scaledDt,
          pos[2] + updatedJet.velocity[2] * scaledDt
        ]
      }
      
      if (updatedJet.position[0] > 100) {
        updatedJet = { ...updatedJet, active: false }
      }
    }
    
    // Update missiles - optimized loop
    for (let i = 0; i < state.missiles.length; i++) {
      const missile = state.missiles[i]
      if (!missile.active) {
        updatedMissiles[i] = missile
        continue
      }
      
      const vel = missile.velocity
      const pos = missile.position
      
      // Smart missile AI - climb then seek
      let newVelocity = [...vel]
      
      if (!missile.apexReached && pos[1] < state.jet.altitude + 20) {
        // Climbing phase - boost upward
        newVelocity[1] += 2 * scaledDt
      } else if (!missile.apexReached) {
        // Reached apex - switch to dive mode
        missile.apexReached = true
        missile.phase = 'dive'
      }
      
      if (missile.apexReached) {
        // Dive and seek target
        const targetX = state.ironDome.position[0]
        const targetY = 0
        const targetZ = state.ironDome.position[2]
        
        const dx = targetX - pos[0]
        const dy = targetY - pos[1]
        const dz = targetZ - pos[2]
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz)
        
        if (dist > 1) {
          const seekStrength = 0.5
          newVelocity[0] += (dx / dist) * seekStrength
          newVelocity[1] += (dy / dist) * seekStrength
          newVelocity[2] += (dz / dist) * seekStrength
        }
      }
      
      // Apply gravity
      const gravityDelta = state.constants.gravity * scaledDt
      newVelocity[1] -= gravityDelta
      
      const newPosition = [
        pos[0] + newVelocity[0] * scaledDt,
        pos[1] + newVelocity[1] * scaledDt,
        pos[2] + newVelocity[2] * scaledDt
      ]
      
      const active = newPosition[1] > 0
      
      const updatedHistory = missile.positionHistory.length >= 10
        ? [...missile.positionHistory.slice(-9), newPosition]
        : [...missile.positionHistory, newPosition]
      
      let projectedPath = missile.projectedPath
      if (updatedHistory.length >= 3) {
        const filtered = missile.kalmanFilter.filter(newPosition, newVelocity)
        projectedPath = projectTrajectory(
          filtered.position,
          filtered.velocity,
          state.constants.gravity,
          5.0,
          0.016
        )
      }
      
      updatedMissiles[i] = {
        ...missile,
        position: newPosition,
        velocity: newVelocity,
        active,
        positionHistory: updatedHistory,
        projectedPath
      }
      
      // Check for interception launch
      if (active) {
        const dx = newPosition[0] - state.ironDome.position[0]
        const dy = newPosition[1] - state.ironDome.position[1]
        const dz = newPosition[2] - state.ironDome.position[2]
        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz)
        
        if (distance < state.ironDome.detectionRadius) {
          const hasInterceptor = state.interceptors.some(i => 
            i.targetId === missile.id && i.active
          )
          
          const activeCount = state.interceptors.filter(i => i.active).length + newInterceptors.length
          
          if (!hasInterceptor && activeCount < state.ironDome.maxInterceptors) {
            const intercept = calculateOptimalInterceptPoint(
              state.ironDome.position,
              updatedMissiles[i],
              state.ironDome.interceptorSpeed
            )
            
            newInterceptors.push({
              id: Date.now() + Math.random(),
              targetId: missile.id,
              position: [...state.ironDome.position],
              velocity: intercept.velocity,
              targetPoint: intercept.targetPoint,
              active: true,
              seekMode: true
            })
          }
        }
      }
    }
    
    // Update interceptors - optimized loop
    for (let i = 0; i < state.interceptors.length; i++) {
      const interceptor = state.interceptors[i]
      if (!interceptor.active) {
        updatedInterceptors[i] = interceptor
        continue
      }
      
      const targetMissile = updatedMissiles.find(m => m.id === interceptor.targetId)
      
      if (!targetMissile || !targetMissile.active) {
        updatedInterceptors[i] = { ...interceptor, active: false }
        continue
      }
      
      // Heat-seeking guidance - actively track target position
      const dx = targetMissile.position[0] - interceptor.position[0]
      const dy = targetMissile.position[1] - interceptor.position[1]
      const dz = targetMissile.position[2] - interceptor.position[2]
      const distToTarget = Math.sqrt(dx*dx + dy*dy + dz*dz)

      // Define baseSpeed FIRST
      const baseSpeed = state.ironDome.interceptorSpeed

      // Auto-propulsion speed multiplier based on distance and threat level
      let speedMultiplier = 1.0
      const missileSpeed = Math.sqrt(
        targetMissile.velocity[0]**2 + 
        targetMissile.velocity[1]**2 + 
        targetMissile.velocity[2]**2
      )

      // Adaptive speed based on threat assessment
      if (distToTarget > 60) {
        speedMultiplier = 2.5 // Long range pursuit - boosted from 1.8
      } else if (distToTarget > 30) {
        speedMultiplier = 3.0 // Medium range intercept - boosted from 2.2
      } else if (distToTarget > 15) {
        speedMultiplier = 3.5 // Close range engagement - boosted from 2.8
      } else if (distToTarget < 10) {
        // Final sprint - match or exceed missile speed
        const threatRatio = missileSpeed / baseSpeed
        speedMultiplier = Math.min(4.5, Math.max(4.0, threatRatio * 1.3))
      }

      // Proportional navigation with heat seeking
      const seekStrength = 2.5 // Increased from 1.5 for more aggressive tracking
      const speed = baseSpeed * speedMultiplier

      let newVel = [...interceptor.velocity]

      if (distToTarget > 0.1) {
        // Steer towards target (heat signature)
        newVel[0] += (dx / distToTarget) * seekStrength
        newVel[1] += (dy / distToTarget) * seekStrength
        newVel[2] += (dz / distToTarget) * seekStrength
        
        // Normalize and maintain speed
        const currentSpeed = Math.sqrt(newVel[0]**2 + newVel[1]**2 + newVel[2]**2)
        if (currentSpeed > 0) {
          newVel[0] = (newVel[0] / currentSpeed) * speed
          newVel[1] = (newVel[1] / currentSpeed) * speed
          newVel[2] = (newVel[2] / currentSpeed) * speed
        }
      }
      
      // Apply minimal gravity for powered flight
      newVel[1] -= state.constants.gravity * scaledDt * 0.05 // Reduced from 0.1 for stronger thrust
      
      const newPos = [
        interceptor.position[0] + newVel[0] * scaledDt,
        interceptor.position[1] + newVel[1] * scaledDt,
        interceptor.position[2] + newVel[2] * scaledDt
      ]
      
      if (newPos[1] <= 0) {
        updatedInterceptors[i] = { ...interceptor, active: false }
        continue
      }
      
      // Increased collision radius for better hit detection
      if (distToTarget < 3) {
        targetMissile.active = false
        updatedInterceptors[i] = { 
          ...interceptor, 
          active: false, 
          exploded: true,
          explosionPos: newPos,
          explosionTime: Date.now()
        }
      } else {
        updatedInterceptors[i] = { 
          ...interceptor, 
          position: newPos,
          velocity: newVel,
          speedMultiplier // Track for visual effects
        }
      }
    }
    
    // Auto-launch interceptors (intelligent defense)
    for (let i = 0; i < updatedMissiles.length; i++) {
      const missile = updatedMissiles[i]
      if (!missile.active) continue
      
      const dx = missile.position[0] - state.ironDome.position[0]
      const dy = missile.position[1] - state.ironDome.position[1]
      const dz = missile.position[2] - state.ironDome.position[2]
      const distance = Math.sqrt(dx*dx + dy*dy + dz*dz)
      
      if (distance < state.ironDome.detectionRadius) {
        const hasInterceptor = state.interceptors.some(i => 
          i.targetId === missile.id && i.active
        )
        
        const activeCount = state.interceptors.filter(i => i.active).length + newInterceptors.length
        
        // Intelligent launch: only if no interceptor assigned and within capacity
        if (!hasInterceptor && activeCount < state.ironDome.maxInterceptors) {
          const intercept = calculateOptimalInterceptPoint(
            state.ironDome.position,
            updatedMissiles[i],
            state.ironDome.interceptorSpeed
          )
          
          newInterceptors.push({
            id: Date.now() + Math.random(),
            targetId: missile.id,
            position: [...state.ironDome.position],
            velocity: intercept.velocity,
            targetPoint: intercept.targetPoint,
            active: true,
            seekMode: true
          })
          
          console.log(`🛡️ Auto-launched interceptor for missile ${missile.id}`)
        }
      }
    }
    
    // Single state update
    set({
      jet: updatedJet,
      missiles: updatedMissiles,
      interceptors: [...updatedInterceptors, ...newInterceptors]
    })
  },

  toggle: () => {
    const state = get()
    set({ running: !state.running })
  },

  setJetSpeed: (speed) => set(state => ({
    jet: { ...state.jet, speed }
  })),

  setJetAltitude: (altitude) => set(state => ({
    jet: { ...state.jet, altitude }
  })),

  setTimeScale: (scale) => set({ timeScale: scale })
}))













