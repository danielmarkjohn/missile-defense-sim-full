import { memo, useEffect, useState } from 'react'

const LoadingScreen = memo(function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState('Initializing...')
  
  useEffect(() => {
    const stages = [
      { progress: 20, text: 'Loading 3D Models...' },
      { progress: 40, text: 'Initializing Physics Engine...' },
      { progress: 60, text: 'Setting up Radar Systems...' },
      { progress: 80, text: 'Calibrating Interceptors...' },
      { progress: 100, text: 'Ready!' }
    ]
    
    let currentStage = 0
    
    const interval = setInterval(() => {
      if (currentStage < stages.length) {
        setProgress(stages[currentStage].progress)
        setLoadingText(stages[currentStage].text)
        currentStage++
      } else {
        clearInterval(interval)
        setTimeout(() => {
          onComplete?.()
        }, 500)
      }
    }, 400)
    
    return () => clearInterval(interval)
  }, [onComplete])
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #001a00 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      fontFamily: '"Courier New", monospace',
      color: '#00ff00'
    }}>
      <div style={{
        fontSize: '32px',
        fontWeight: 'bold',
        marginBottom: '40px',
        textShadow: '0 0 20px #00ff00',
        animation: 'pulse 2s ease-in-out infinite'
      }}>
        🛡️ MISSILE DEFENSE SYSTEM
      </div>
      
      <div style={{
        width: '400px',
        maxWidth: '80vw',
        marginBottom: '20px'
      }}>
        <div style={{
          width: '100%',
          height: '30px',
          background: 'rgba(0, 255, 0, 0.1)',
          border: '2px solid #00ff00',
          borderRadius: '4px',
          overflow: 'hidden',
          boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #00ff00 0%, #00ff00 50%, #00cc00 100%)',
            transition: 'width 0.3s ease-out',
            boxShadow: '0 0 10px #00ff00'
          }} />
        </div>
      </div>
      
      <div style={{
        fontSize: '16px',
        color: '#00ddff',
        marginBottom: '10px',
        minHeight: '24px'
      }}>
        {loadingText}
      </div>
      
      <div style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#00ff00',
        textShadow: '0 0 10px #00ff00'
      }}>
        {progress}%
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  )
})

export default LoadingScreen

