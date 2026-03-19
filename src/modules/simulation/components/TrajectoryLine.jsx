import { Line } from '@react-three/drei'

export function TrajectoryLine({ points, color = '#ff0000', opacity = 0.6, lineWidth = 2 }) {
  if (!points || points.length < 2) return null
  
  return (
    <Line
      points={points}
      color={color}
      lineWidth={lineWidth}
      opacity={opacity}
      transparent
      dashed={false}
    />
  )
}

export function ProjectedTrajectory({ missile }) {
  if (!missile.projectedPath || missile.projectedPath.length < 2) return null
  
  return (
    <TrajectoryLine 
      points={missile.projectedPath}
      color="#00ff00"
      opacity={0.4}
      lineWidth={1.5}
    />
  )
}

