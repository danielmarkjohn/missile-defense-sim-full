import { Line } from '@react-three/drei'

export function TrackingLine({ interceptor, targetMissile }) {
  if (!interceptor.active || !targetMissile?.active) return null
  
  const points = [
    interceptor.position,
    targetMissile.position
  ]
  
  return (
    <Line
      points={points}
      color="#00ffff"
      lineWidth={1}
      opacity={0.3}
      transparent
      dashed
      dashScale={2}
      dashSize={1}
      gapSize={1}
    />
  )
}