import { create } from 'zustand'
import { updateMissile, updateInterceptor, calculateInterceptPath } from '../modules/simulation/physics/update'
import { projectTrajectory } from '../modules/simulation/physics/projection'
import { calculateOptimalInterceptPoint } from '../modules/simulation/physics/interception'
import { KalmanFilter } from '../modules/simulation/physics/kalman'

export const useSimStore = create((set, get) => ({
  running: false,
  timeScale: 1.0,

  constants: {
    gravity: 9.8,
    metersToKm: 0.001,
    kmToMeters: 1000,
    missileTerminalVelocity: 800,
    interceptorMaxSpeed: 1200,
    radarUpdateRate: 0.1,
    guidanceUpdateRate: 0.05
  },

  ironDome: {
    position: [0, 0, 0],
    detectionRadius: 120, // Increased from 70 to 120 km (scaled for visibility)
    maxInterceptors: 20,
    interceptorSpeed: 80, // Reduced from 250 to 80 m/s for better visual tracking
    radarRange: 150,
    trackingAccuracy: 0.95
  },

  jet: {
    position: [-80, 50, -40], // scaled coordinates
    velocity: [25, 0, 12.5], // scaled velocity
    active: false,
    speed: 25, // scaled speed
    altitude: 50, // scaled altitude - increased to 50km
    lastMissileRelease: 0,
    missileCount: 0
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

    // Random attack patterns with varied trajectories
    const randomAngle = Math.random() * Math.PI * 2 // 0 to 360 degrees
    const randomElevation = 0.3 + Math.random() * 0.4 // 0.3 to 0.7 elevation factor
    
    // Random horizontal direction
    const horizontalSpeed = 8 + Math.random() * 8 // 8-16 m/s horizontal
    const vx = Math.cos(randomAngle) * horizontalSpeed
    const vz = Math.sin(randomAngle) * horizontalSpeed
    
    // Vertical component for ballistic arc
    const vy = 8 + Math.random() * 6 // 8-14 m/s vertical
    
    // Random target apex height
    const targetApex = 45 + Math.random() * 25 // 45-70 km apex
    
    const timestamp = Date.now()

    const newMissile = {
      id: timestamp + Math.random(),
      position: [state.jet.position[0], state.jet.position[1], state.jet.position[2]],
      velocity: [vx, vy, vz],
      active: true,
      positionHistory: [],
      projectedPath: [],
      kalmanFilter: new KalmanFilter(),
      phase: 'boost',
      apexReached: false,
      targetApex: targetApex,
      targetPos: [
        Math.random() * 60 - 30, // Random X: -30 to 30
        0,
        Math.random() * 60 - 30  // Random Z: -30 to 30
      ],
      launchTime: timestamp,
      thrustDuration: 4.0 // Slightly longer boost for visual effect
    }

    set(state => ({
      missiles: [...state.missiles, newMissile]
    }))
  },
  
  step: (dt) => {
    const state = get()
    if (!state.running) return
    
    // Cap delta time to prevent huge jumps and smooth out frame spikes
    const cappedDt = Math.min(dt, 0.033) // Max 33ms per frame
    const scaledDt = cappedDt * state.timeScale
    
    // Update jet position
    let updatedJet = { ...state.jet }
    if (state.jet.active) {
      updatedJet.position = [
        state.jet.position[0] + state.jet.velocity[0] * scaledDt,
        state.jet.position[1] + state.jet.velocity[1] * scaledDt,
        state.jet.position[2] + state.jet.velocity[2] * scaledDt
      ]
      
      if (updatedJet.position[0] > 100) {
        updatedJet.active = false
      }
    }
    
    // Update missiles with optimized physics
    const updatedMissiles = [...state.missiles]
    const newInterceptors = []
    const currentTime = Date.now()
    
    for (let i = 0; i < updatedMissiles.length; i++) {
      const missile = updatedMissiles[i]
      if (!missile.active) continue
      
      const pos = missile.position
      let newVelocity = [...missile.velocity]

      // Simplified physics - less computation
      newVelocity[1] -= state.constants.gravity * scaledDt

      const speed = Math.sqrt(newVelocity[0]**2 + newVelocity[1]**2 + newVelocity[2]**2)
      const dragFactor = Math.max(0.95, 1 - (0.001 * speed * scaledDt))
      newVelocity[0] *= dragFactor
      newVelocity[1] *= dragFactor
      newVelocity[2] *= dragFactor

      const newPos = [
        pos[0] + newVelocity[0] * scaledDt,
        pos[1] + newVelocity[1] * scaledDt,
        pos[2] + newVelocity[2] * scaledDt
      ]

      if (newPos[1] <= 0) {
        updatedMissiles[i] = { ...missile, active: false }
        continue
      }

      // Limit position history to reduce memory
      const posHistory = (missile.positionHistory || []).slice(-30)
      posHistory.push(newPos)

      updatedMissiles[i] = {
        ...missile,
        position: newPos,
        velocity: newVelocity,
        positionHistory: posHistory
      }

      // Detection and interception logic - throttled
      const distToDome = Math.sqrt(
        (newPos[0] - state.ironDome.position[0])**2 +
        (newPos[1] - state.ironDome.position[1])**2 +
        (newPos[2] - state.ironDome.position[2])**2
      )

      if (distToDome < state.ironDome.detectionRadius) {
        if (!missile.detected) {
          updatedMissiles[i].detected = true
          updatedMissiles[i].detectionTime = currentTime
        }

        const activeCount = state.interceptors.filter(int => int.active).length
        const hasInterceptor = state.interceptors.some(int => 
          int.targetId === missile.id && int.active
        )

        const timeSinceDetection = (currentTime - (missile.detectionTime || currentTime)) / 1000

        // Launch interceptor with delay and limit
        if (!hasInterceptor && activeCount < state.ironDome.maxInterceptors && timeSinceDetection >= 0.5) {
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
            seekMode: true,
            launchTime: currentTime
          })
        }
      }
    }
    
    // Update interceptors with optimized collision detection
    const updatedInterceptors = [...state.interceptors]
    
    for (let i = 0; i < updatedInterceptors.length; i++) {
      const interceptor = updatedInterceptors[i]
      if (!interceptor.active) continue

      const targetMissile = updatedMissiles.find(m => m.id === interceptor.targetId && m.active)

      if (!targetMissile) {
        updatedInterceptors[i] = { ...interceptor, active: false }
        continue
      }

      const dx = targetMissile.position[0] - interceptor.position[0]
      const dy = targetMissile.position[1] - interceptor.position[1]
      const dz = targetMissile.position[2] - interceptor.position[2]
      const distToTarget = Math.sqrt(dx*dx + dy*dy + dz*dz)

      // Collision detection - optimized threshold
      if (distToTarget < 2.5) {
        const targetIdx = updatedMissiles.findIndex(m => m.id === targetMissile.id)
        if (targetIdx !== -1) {
          updatedMissiles[targetIdx] = { ...targetMissile, active: false }
        }

        updatedInterceptors[i] = {
          ...interceptor,
          active: false,
          exploded: true,
          explosionPos: [...interceptor.position],
          explosionTime: currentTime,
          impactStats: {
            altitude: (interceptor.position[1] * 0.001).toFixed(2),
            velocity: Math.sqrt(
              interceptor.velocity[0]**2 + 
              interceptor.velocity[1]**2 + 
              interceptor.velocity[2]**2
            ).toFixed(1),
            flightTime: ((currentTime - interceptor.launchTime) / 1000).toFixed(2),
            precision: distToTarget.toFixed(2)
          }
        }
        continue
      }

      // Adaptive speed based on distance
      const baseSpeed = state.ironDome.interceptorSpeed
      let speedMultiplier = 1.0

      if (distToTarget < 15) {
        speedMultiplier = 1.3
      } else if (distToTarget < 40) {
        speedMultiplier = 1.15
      }

      const effectiveSpeed = baseSpeed * speedMultiplier

      let newVel = [...interceptor.velocity]

      if (distToTarget > 0.5) {
        const dirX = dx / distToTarget
        const dirY = dy / distToTarget
        const dirZ = dz / distToTarget

        newVel[0] = dirX * effectiveSpeed
        newVel[1] = dirY * effectiveSpeed
        newVel[2] = dirZ * effectiveSpeed
      }

      // Reduced gravity effect
      newVel[1] -= state.constants.gravity * scaledDt * 0.1

      const newPos = [
        interceptor.position[0] + newVel[0] * scaledDt,
        interceptor.position[1] + newVel[1] * scaledDt,
        interceptor.position[2] + newVel[2] * scaledDt
      ]

      if (newPos[1] <= 0) {
        updatedInterceptors[i] = { ...interceptor, active: false }
        continue
      }

      updatedInterceptors[i] = {
        ...interceptor,
        position: newPos,
        velocity: newVel,
        speedMultiplier
      }
    }

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













