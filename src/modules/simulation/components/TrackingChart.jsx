import { useEffect, useRef } from 'react'

export function TrackingChart({ missiles, interceptors }) {
  const canvasRef = useRef()
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    
    // Clear
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, width, height)
    
    // Grid
    ctx.strokeStyle = '#003300'
    ctx.lineWidth = 1
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * width
      const y = (i / 10) * height
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
    
    // Center crosshair
    ctx.strokeStyle = '#00ff00'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(width/2 - 10, height/2)
    ctx.lineTo(width/2 + 10, height/2)
    ctx.moveTo(width/2, height/2 - 10)
    ctx.lineTo(width/2, height/2 + 10)
    ctx.stroke()
    
    // Plot missiles
    missiles.filter(m => m.active).forEach(missile => {
      const x = width/2 + missile.position[0] * 2
      const z = height/2 + missile.position[2] * 2
      
      if (x >= 0 && x <= width && z >= 0 && z <= height) {
        ctx.fillStyle = '#ff0000'
        ctx.beginPath()
        ctx.arc(x, z, 4, 0, Math.PI * 2)
        ctx.fill()
        
        // Velocity vector
        ctx.strokeStyle = '#ff000088'
        ctx.beginPath()
        ctx.moveTo(x, z)
        ctx.lineTo(x + missile.velocity[0] * 3, z + missile.velocity[2] * 3)
        ctx.stroke()
      }
    })
    
    // Plot interceptors
    interceptors.filter(i => i.active).forEach(interceptor => {
      const x = width/2 + interceptor.position[0] * 2
      const z = height/2 + interceptor.position[2] * 2
      
      if (x >= 0 && x <= width && z >= 0 && z <= height) {
        ctx.fillStyle = '#00ffff'
        ctx.beginPath()
        ctx.arc(x, z, 3, 0, Math.PI * 2)
        ctx.fill()
        
        // Target line
        const target = missiles.find(m => m.id === interceptor.targetId && m.active)
        if (target) {
          const tx = width/2 + target.position[0] * 2
          const tz = height/2 + target.position[2] * 2
          ctx.strokeStyle = '#00ffff44'
          ctx.setLineDash([5, 5])
          ctx.beginPath()
          ctx.moveTo(x, z)
          ctx.lineTo(tx, tz)
          ctx.stroke()
          ctx.setLineDash([])
        }
      }
    })
    
  }, [missiles, interceptors])
  
  return (
    <canvas 
      ref={canvasRef} 
      width={200} 
      height={200}
      style={{
        border: '1px solid #00ff00',
        boxShadow: '0 0 10px #00ff0044'
      }}
    />
  )
}