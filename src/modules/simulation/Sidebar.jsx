import { useSimStore } from '../../store/simStore'

export default function Sidebar() {
  const { 
    running, 
    jet, 
    missiles, 
    interceptors,
    ironDome,
    constants,
    launchJet, 
    releaseMissile, 
    reset 
  } = useSimStore()

  const matrixGreen = '#00ff41'
  const darkGreen = '#003b00'
  const glowGreen = '#39ff14'

  return (
    <div style={{
      position: 'absolute',
      right: 20,
      top: 20,
      background: 'rgba(0, 0, 0, 0.95)',
      color: matrixGreen,
      padding: '20px',
      borderRadius: '4px',
      minWidth: '280px',
      fontFamily: '"Courier New", monospace',
      fontSize: '13px',
      border: `2px solid ${matrixGreen}`,
      boxShadow: `0 0 20px ${darkGreen}, inset 0 0 20px rgba(0, 255, 65, 0.1)`
    }}>
      <h2 style={{ 
        margin: '0 0 20px 0', 
        fontSize: '18px', 
        borderBottom: `2px solid ${matrixGreen}`, 
        paddingBottom: '10px',
        textShadow: `0 0 10px ${glowGreen}`,
        letterSpacing: '2px'
      }}>
        🛡️ IRON DOME CONTROL
      </h2>
      
      {/* Status */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ 
          margin: '0 0 10px 0', 
          fontSize: '14px', 
          color: glowGreen,
          textShadow: `0 0 5px ${glowGreen}`
        }}>
          STATUS
        </h3>
        <div style={{ fontSize: '12px', lineHeight: '1.8' }}>
          <div>Simulation: {running ? '🟢 Running' : '⏸️ Paused'}</div>
          <div>Jet: {jet.active ? '✈️ Active' : '⏸️ Idle'}</div>
          <div>Missiles: {missiles.filter(m => m.active).length}</div>
          <div>Interceptors: {interceptors.filter(i => i.active).length}/{ironDome.maxInterceptors}</div>
        </div>
      </div>
      
      {/* Jet Controls */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ 
          margin: '0 0 10px 0', 
          fontSize: '14px', 
          color: glowGreen,
          textShadow: `0 0 5px ${glowGreen}`
        }}>
          JET CONTROLS
        </h3>
        <button
          onClick={launchJet}
          disabled={jet.active}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '8px',
            background: jet.active ? darkGreen : `linear-gradient(135deg, ${darkGreen} 0%, #005500 100%)`,
            color: matrixGreen,
            border: `1px solid ${matrixGreen}`,
            borderRadius: '2px',
            cursor: jet.active ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            fontWeight: 'bold',
            fontFamily: '"Courier New", monospace',
            textShadow: `0 0 5px ${glowGreen}`,
            boxShadow: jet.active ? 'none' : `0 0 10px ${darkGreen}`,
            transition: 'all 0.2s',
            opacity: jet.active ? 0.5 : 1
          }}
          onMouseEnter={(e) => {
            if (!jet.active) {
              e.target.style.boxShadow = `0 0 15px ${glowGreen}`
              e.target.style.transform = 'translateY(-2px)'
            }
          }}
          onMouseLeave={(e) => {
            if (!jet.active) {
              e.target.style.boxShadow = `0 0 10px ${darkGreen}`
              e.target.style.transform = 'translateY(0)'
            }
          }}
        >
          ✈️ LAUNCH JET FLYBY
        </button>
        
        <button
          onClick={releaseMissile}
          disabled={!jet.active}
          style={{
            width: '100%',
            padding: '10px',
            background: !jet.active ? darkGreen : `linear-gradient(135deg, #ff0000 0%, #cc0000 100%)`,
            color: !jet.active ? '#005500' : '#ffff00',
            border: `1px solid ${!jet.active ? '#003300' : '#ff0000'}`,
            borderRadius: '2px',
            cursor: !jet.active ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            fontWeight: 'bold',
            fontFamily: '"Courier New", monospace',
            textShadow: !jet.active ? 'none' : '0 0 5px #ff0000',
            boxShadow: !jet.active ? 'none' : '0 0 10px #ff0000',
            transition: 'all 0.2s',
            opacity: !jet.active ? 0.5 : 1
          }}
          onMouseEnter={(e) => {
            if (jet.active) {
              e.target.style.boxShadow = '0 0 20px #ff0000'
              e.target.style.transform = 'translateY(-2px)'
            }
          }}
          onMouseLeave={(e) => {
            if (jet.active) {
              e.target.style.boxShadow = '0 0 10px #ff0000'
              e.target.style.transform = 'translateY(0)'
            }
          }}
        >
          🚀 RELEASE MISSILE
        </button>
      </div>
      
      {/* Reset Control */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={reset}
          style={{
            width: '100%',
            padding: '10px',
            background: `linear-gradient(135deg, ${darkGreen} 0%, #004400 100%)`,
            color: matrixGreen,
            border: `1px solid ${matrixGreen}`,
            borderRadius: '2px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 'bold',
            fontFamily: '"Courier New", monospace',
            textShadow: `0 0 5px ${glowGreen}`,
            boxShadow: `0 0 10px ${darkGreen}`,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = `0 0 20px ${glowGreen}`
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = `0 0 10px ${darkGreen}`
          }}
        >
          🔄 RESET SIMULATION
        </button>
      </div>
      
      {/* System Info */}
      <div>
        <h3 style={{ 
          margin: '0 0 10px 0', 
          fontSize: '14px', 
          color: glowGreen,
          textShadow: `0 0 5px ${glowGreen}`
        }}>
          SYSTEM INFO
        </h3>
        <div style={{ fontSize: '11px', lineHeight: '1.8', opacity: 0.8 }}>
          <div>Detection Radius: {ironDome.detectionRadius}m</div>
          <div>Interceptor Speed: {ironDome.interceptorSpeed}m/s</div>
          <div>Gravity: {constants.gravity}m/s²</div>
        </div>
      </div>
    </div>
  )
}



