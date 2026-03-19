import { create } from 'zustand'
import { updateMissile, updateInterceptor, calculateInterceptPath } from '../modules/simulation/physics/update'
import { projectTrajectory } from '../modules/simulation/physics/projection'
import { calculateOptimalInterceptPoint } from '../modules/simulation/physics/interception'
import { KalmanFilter } from '../modules/simulation/physics/kalman'

export const useSimStore = create((set, get) => ({
  running: false,
  
  constants: {
    gravity: 9.8
  },
  
  ironDome: {
    position: [0, 0, 0],
    detectionRadius: 100,
    maxInterceptors: 20,
    interceptorSpeed: 60
  },
  
  jet: {
    position: [-80, 30, -40],
    velocity: [40, 0, 20],
    active: false
  },
  
  missiles: [],
  interceptors: [],
  
  start: () => set({ running: true }),
  pause: () => set({ running: false }),
  
  reset: () => set({
    running: false,
    jet: {
      position: [-80, 30, -40],
      velocity: [40, 0, 20],
      active: false
    },
    missiles: [],
    interceptors: []
  }),
  
  launchJet: () => {
    console.log('🚀 Launching jet...')
    set(state => ({
      jet: { 
        ...state.jet, 
        active: true,
        position: [-80, 30, -40],
        velocity: [40, 0, 20]
      },
      running: true
    }))
  },
  
  releaseMissile: () => {
    const state = get()
    if (!state.jet.active) {
      console.log('❌ Cannot release missile - jet not active')
      return
    }
    
    console.log('💣 Releasing missile from jet at', state.jet.position)
    
    const newMissile = {
      id: Date.now() + Math.random(),
      position: [...state.jet.position],
      velocity: [
        state.jet.velocity[0] * 0.3,
        -20,
        state.jet.velocity[2] * 0.3
      ],
      active: true,
      positionHistory: [],
      projectedPath: [],
      kalmanFilter: new KalmanFilter()
    }
    
    set(state => ({
      missiles: [...state.missiles, newMissile]
    }))
  },
  
  step: (dt) => {
    const state = get()
    if (!state.running) return
    
    let updatedMissiles = [...state.missiles]
    let updatedInterceptors = [...state.interceptors]
    
    // Update jet
    let updatedJet = { ...state.jet }
    if (updatedJet.active) {
      updatedJet = {
        ...updatedJet,
        position: [
          updatedJet.position[0] + updatedJet.velocity[0] * dt,
          updatedJet.position[1] + updatedJet.velocity[1] * dt,
          updatedJet.position[2] + updatedJet.velocity[2] * dt
        ]
      }
      
      if (updatedJet.position[0] > 100) {
        updatedJet.active = false
        console.log('✈️ Jet completed flyby')
      }
    }
    
    // Update missiles
    updatedMissiles = updatedMissiles.map(missile => {
      if (!missile.active) return missile
      
      const newVelocity = [
        missile.velocity[0],
        missile.velocity[1] - state.constants.gravity * dt,
        missile.velocity[2]
      ]
      
      const newPosition = [
        missile.position[0] + newVelocity[0] * dt,
        missile.position[1] + newVelocity[1] * dt,
        missile.position[2] + newVelocity[2] * dt
      ]
      
      const active = newPosition[1] > 0
      
      if (!active && missile.active) {
        console.log('💥 Missile', missile.id, 'hit ground')
      }
      
      const updatedHistory = [...missile.positionHistory, newPosition].slice(-10)
      
      let projectedPath = []
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
      
      return {
        ...missile,
        position: newPosition,
        velocity: newVelocity,
        active,
        positionHistory: updatedHistory,
        projectedPath
      }
    })
    
    // Auto-launch interceptors
    updatedMissiles.forEach(missile => {
      if (!missile.active) return
      
      const dx = missile.position[0] - state.ironDome.position[0]
      const dy = missile.position[1] - state.ironDome.position[1]
      const dz = missile.position[2] - state.ironDome.position[2]
      const distance = Math.sqrt(dx*dx + dy*dy + dz*dz)
      
      if (distance < state.ironDome.detectionRadius) {
        const hasInterceptor = updatedInterceptors.some(i => 
          i.targetId === missile.id && i.active
        )
        
        const activeInterceptors = updatedInterceptors.filter(i => i.active).length
        
        if (!hasInterceptor && activeInterceptors < state.ironDome.maxInterceptors) {
          console.log('🎯 Launching interceptor for missile', missile.id)
          
          const intercept = calculateOptimalInterceptPoint(
            state.ironDome.position,
            missile,
            state.ironDome.interceptorSpeed
          )
          
          const newInterceptor = {
            id: Date.now() + Math.random(),
            position: [state.ironDome.position[0], state.ironDome.position[1] + 2, state.ironDome.position[2]],
            velocity: intercept.velocity,
            targetId: missile.id,
            targetPoint: intercept.targetPoint,
            active: true
          }
          
          updatedInterceptors.push(newInterceptor)
        }
      }
    })
    
    // Update interceptors
    updatedInterceptors = updatedInterceptors.map(interceptor => {
      if (!interceptor.active) return interceptor
      
      const newPosition = [
        interceptor.position[0] + interceptor.velocity[0] * dt,
        interceptor.position[1] + interceptor.velocity[1] * dt,
        interceptor.position[2] + interceptor.velocity[2] * dt
      ]
      
      const active = newPosition[1] > 0
      
      return {
        ...interceptor,
        position: newPosition,
        active
      }
    })
    
    // Check for interceptions
    updatedInterceptors.forEach(interceptor => {
      if (!interceptor.active) return
      
      updatedMissiles.forEach(missile => {
        if (!missile.active) return
        
        const dx = interceptor.position[0] - missile.position[0]
        const dy = interceptor.position[1] - missile.position[1]
        const dz = interceptor.position[2] - missile.position[2]
        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz)
        
        if (distance < 5) {
          console.log('💥💥💥 INTERCEPTION!')
          interceptor.active = false
          missile.active = false
        }
      })
    })
    
    // Clean up
    updatedMissiles = updatedMissiles.filter(m => m.active)
    updatedInterceptors = updatedInterceptors.filter(i => i.active)
    
    set({
      jet: updatedJet,
      missiles: updatedMissiles,
      interceptors: updatedInterceptors
    })
  },

  toggle: () => {
    const state = get()
    set({ running: !state.running })
  }
}))













