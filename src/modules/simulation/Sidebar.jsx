import { useState } from 'react'
import { useSimStore } from '../../store/simStore'
import { TrackingChart } from './components/TrackingChart'

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState('controls')
  
  const {
    running,
    jet,
    missiles,
    interceptors,
    ironDome,
    constants,
    timeScale,
    start,
    pause,
    launchJet,
    releaseMissile,
    reset,
    setJetSpeed,
    setJetAltitude,
    setTimeScale
  } = useSimStore()

  const matrixGreen = '#00ff41'
  const darkGreen = '#003300'
  const glowGreen = '#00ff65'

  const buttonStyle = (disabled = false) => ({
    width: '100%',
    padding: '8px 12px',
    marginBottom: '6px',
    background: disabled ? darkGreen : `linear-gradient(135deg, ${matrixGreen} 0%, #00cc33 100%)`,
    color: disabled ? '#004400' : '#000000',
    border: `1px solid ${disabled ? '#002200' : matrixGreen}`,
    borderRadius: '3px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: '"Courier New", monospace',
    fontSize: '11px',
    fontWeight: 'bold',
    textShadow: disabled ? 'none' : `0 0 5px ${glowGreen}`,
    boxShadow: disabled ? 'none' : `0 0 10px ${darkGreen}`,
    transition: 'all 0.2s',
    opacity: disabled ? 0.5 : 1
  })

  return (
    <div style={{
      position: 'absolute',
      right: 10,
      top: 10,
      bottom: 10,
      background: 'rgba(0, 0, 0, 0.95)',
      color: matrixGreen,
      padding: '0',
      borderRadius: '4px',
      width: '320px',
      fontFamily: '"Courier New", monospace',
      fontSize: '11px',
      border: `2px solid ${matrixGreen}`,
      boxShadow: `0 0 20px ${darkGreen}, inset 0 0 20px rgba(0, 255, 65, 0.1)`,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '12px 15px',
        borderBottom: `2px solid ${matrixGreen}`,
      }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: '16px', 
          textShadow: `0 0 10px ${glowGreen}`,
          letterSpacing: '2px'
        }}>
          🛡️ MISSILE DEFENSE SIM
        </h2>
      </div>

      {/* Status Bar */}
      <div style={{
        padding: '8px 15px',
        background: 'rgba(0, 255, 65, 0.05)',
        borderBottom: `1px solid ${darkGreen}`,
        fontSize: '10px',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>{running ? '🟢 ACTIVE' : '⏸️ PAUSED'}</span>
        <span>Jet: {jet.active ? '✈️' : '⏸️'}</span>
        <span>🚀 {missiles.filter(m => m.active).length}</span>
        <span>🔵 {interceptors.filter(i => i.active).length}/{ironDome.maxInterceptors}</span>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: `2px solid ${matrixGreen}`,
        background: 'rgba(0, 255, 65, 0.03)'
      }}>
        {['controls', 'radar', 'info'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '10px',
              background: activeTab === tab ? 'rgba(0, 255, 65, 0.15)' : 'transparent',
              color: activeTab === tab ? glowGreen : matrixGreen,
              border: 'none',
              borderRight: tab !== 'info' ? `1px solid ${darkGreen}` : 'none',
              cursor: 'pointer',
              fontFamily: '"Courier New", monospace',
              fontSize: '10px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              transition: 'all 0.2s',
              textShadow: activeTab === tab ? `0 0 8px ${glowGreen}` : 'none'
            }}
          >
            {tab === 'controls' && '⚙️ CTRL'}
            {tab === 'radar' && '📡 RADAR'}
            {tab === 'info' && 'ℹ️ INFO'}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '15px',
        scrollbarWidth: 'thin',
        scrollbarColor: `${matrixGreen} ${darkGreen}`
      }}>
        {activeTab === 'controls' && (
          <>
            {/* Simulation Controls */}
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '12px', 
                color: glowGreen,
                textShadow: `0 0 5px ${glowGreen}`
              }}>
                SIMULATION
              </h3>
              <button onClick={running ? pause : start} style={buttonStyle()}>
                {running ? '⏸️ PAUSE' : '▶️ START'}
              </button>
              
              <div style={{ marginTop: '8px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '10px' }}>
                  Time Scale: {timeScale.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={timeScale}
                  onChange={(e) => setTimeScale(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Jet Controls */}
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '12px', 
                color: glowGreen,
                textShadow: `0 0 5px ${glowGreen}`
              }}>
                JET CONTROLS
              </h3>
              <button onClick={launchJet} disabled={jet.active} style={buttonStyle(jet.active)}>
                ✈️ LAUNCH JET
              </button>
              
              <div style={{ marginTop: '8px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '10px' }}>
                  Speed: {jet.speed}m/s
                </label>
                <input
                  type="range"
                  min="15"
                  max="35"
                  step="1"
                  value={jet.speed}
                  onChange={(e) => setJetSpeed(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginTop: '8px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '10px' }}>
                  Altitude: {jet.altitude}km
                </label>
                <input
                  type="range"
                  min="30"
                  max="70"
                  step="5"
                  value={jet.altitude}
                  onChange={(e) => setJetAltitude(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
              
              <button
                onClick={releaseMissile}
                disabled={!jet.active}
                style={{
                  ...buttonStyle(!jet.active),
                  background: !jet.active ? darkGreen : `linear-gradient(135deg, #ff0000 0%, #cc0000 100%)`,
                  color: !jet.active ? '#550000' : '#ffffff',
                  border: `1px solid ${!jet.active ? '#330000' : '#ff0000'}`,
                  boxShadow: !jet.active ? 'none' : '0 0 10px #ff0000',
                  marginTop: '8px'
                }}
              >
                🚀 RELEASE MISSILE
              </button>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '12px', 
                color: glowGreen,
                textShadow: `0 0 5px ${glowGreen}`
              }}>
                QUICK ACTIONS
              </h3>
              <button onClick={reset} style={buttonStyle()}>
                🔄 RESET
              </button>
            </div>
          </>
        )}

        {activeTab === 'radar' && (
          <>
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '12px', 
                color: glowGreen,
                textShadow: `0 0 5px ${glowGreen}`
              }}>
                TRACKING DISPLAY
              </h3>
              <TrackingChart missiles={missiles} interceptors={interceptors} />
            </div>
          </>
        )}

        {activeTab === 'info' && (
          <>
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '12px', 
                color: glowGreen,
                textShadow: `0 0 5px ${glowGreen}`
              }}>
                SYSTEM SPECS
              </h3>
              <div style={{ fontSize: '10px', lineHeight: '1.8' }}>
                <div style={{ marginBottom: '4px', paddingBottom: '4px', borderBottom: `1px solid ${darkGreen}` }}>
                  <strong>Missile Defense System</strong>
                </div>
                <div>Detection Radius: {ironDome.detectionRadius}km</div>
                <div>Radar Range: {ironDome.radarRange}km</div>
                <div>Max Interceptors: {ironDome.maxInterceptors}</div>
                <div>Interceptor Speed: {ironDome.interceptorSpeed}m/s</div>
                <div>Tracking Accuracy: {(ironDome.trackingAccuracy * 100).toFixed(0)}%</div>
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '12px', 
                color: glowGreen,
                textShadow: `0 0 5px ${glowGreen}`
              }}>
                PHYSICS CONSTANTS
              </h3>
              <div style={{ fontSize: '10px', lineHeight: '1.8' }}>
                <div>Gravity: {constants.gravity}m/s²</div>
                <div>Missile Terminal V: {constants.missileTerminalVelocity}m/s</div>
                <div>Interceptor Max V: {constants.interceptorMaxSpeed}m/s</div>
                <div>Radar Update: {(1/constants.radarUpdateRate).toFixed(0)}Hz</div>
                <div>Guidance Update: {(1/constants.guidanceUpdateRate).toFixed(0)}Hz</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}



