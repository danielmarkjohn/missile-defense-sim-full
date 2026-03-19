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
  const darkGreen = '#003b00'
  const glowGreen = '#39ff14'

  const tabStyle = (isActive) => ({
    flex: 1,
    padding: '8px 4px',
    background: isActive ? `linear-gradient(135deg, ${darkGreen} 0%, #005500 100%)` : 'transparent',
    color: isActive ? glowGreen : matrixGreen,
    border: `1px solid ${isActive ? glowGreen : matrixGreen}`,
    borderBottom: 'none',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 'bold',
    fontFamily: '"Courier New", monospace',
    textShadow: isActive ? `0 0 5px ${glowGreen}` : 'none',
    transition: 'all 0.2s',
    opacity: isActive ? 1 : 0.6
  })

  const buttonStyle = (disabled = false) => ({
    width: '100%',
    padding: '8px',
    marginBottom: '6px',
    background: disabled ? darkGreen : `linear-gradient(135deg, ${darkGreen} 0%, #005500 100%)`,
    color: disabled ? '#005500' : matrixGreen,
    border: `1px solid ${disabled ? '#003300' : matrixGreen}`,
    borderRadius: '2px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '11px',
    fontWeight: 'bold',
    fontFamily: '"Courier New", monospace',
    textShadow: disabled ? 'none' : `0 0 5px ${glowGreen}`,
    boxShadow: disabled ? 'none' : `0 0 8px ${darkGreen}`,
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
        padding: '0 10px'
      }}>
        <button onClick={() => setActiveTab('controls')} style={tabStyle(activeTab === 'controls')}>
          ⚙️ CONTROLS
        </button>
        <button onClick={() => setActiveTab('radar')} style={tabStyle(activeTab === 'radar')}>
          📡 RADAR
        </button>
        <button onClick={() => setActiveTab('info')} style={tabStyle(activeTab === 'info')}>
          ℹ️ INFO
        </button>
      </div>

      {/* Scrollable Content */}
      <div style={{ 
        flex: 1,
        overflowY: 'auto',
        padding: '12px 15px',
        fontSize: '11px'
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
              <button
                onClick={running ? pause : start}
                style={{
                  ...buttonStyle(),
                  background: running 
                    ? `linear-gradient(135deg, #ff6600 0%, #cc5500 100%)`
                    : `linear-gradient(135deg, ${darkGreen} 0%, #005500 100%)`,
                  color: running ? '#ffff00' : matrixGreen,
                  border: `1px solid ${running ? '#ff6600' : matrixGreen}`,
                  boxShadow: running ? '0 0 10px #ff6600' : `0 0 8px ${darkGreen}`
                }}
              >
                {running ? '⏸️ PAUSE' : '▶️ START'}
              </button>
              
              <label style={{ fontSize: '10px', display: 'block', marginBottom: '3px' }}>
                Speed: {timeScale.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={timeScale}
                onChange={(e) => setTimeScale(Number(e.target.value))}
                style={{ width: '100%', marginBottom: '8px' }}
              />
            </div>
            
            {/* Jet Controls */}
            <div>
              <h3 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '12px', 
                color: glowGreen,
                textShadow: `0 0 5px ${glowGreen}`
              }}>
                JET CONTROLS
              </h3>
              
              <button
                onClick={launchJet}
                disabled={jet.active}
                style={{
                  ...buttonStyle(jet.active),
                  background: jet.active ? darkGreen : `linear-gradient(135deg, #00ff00 0%, #00cc00 100%)`,
                  color: jet.active ? '#005500' : '#000000',
                  border: `1px solid ${jet.active ? '#003300' : '#00ff00'}`,
                  boxShadow: jet.active ? 'none' : '0 0 10px #00ff00'
                }}
              >
                ✈️ LAUNCH JET
              </button>
              
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
              
              <div style={{ marginTop: '12px' }}>
                <label style={{ fontSize: '10px', display: 'block', marginBottom: '3px' }}>
                  Jet Speed: {jet.speed} m/s
                </label>
                <input
                  type="range"
                  min="15"
                  max="50"
                  step="1"
                  value={jet.speed}
                  onChange={(e) => setJetSpeed(Number(e.target.value))}
                  disabled={jet.active}
                  style={{ width: '100%', marginBottom: '8px', opacity: jet.active ? 0.5 : 1 }}
                />
                
                <label style={{ fontSize: '10px', display: 'block', marginBottom: '3px' }}>
                  Jet Altitude: {jet.altitude} km
                </label>
                <input
                  type="range"
                  min="30"
                  max="70"
                  step="5"
                  value={jet.altitude}
                  onChange={(e) => setJetAltitude(Number(e.target.value))}
                  disabled={jet.active}
                  style={{ width: '100%', opacity: jet.active ? 0.5 : 1 }}
                />
              </div>
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

            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '12px', 
                color: glowGreen,
                textShadow: `0 0 5px ${glowGreen}`
              }}>
                THREAT ANALYSIS
              </h3>
              <div style={{ fontSize: '10px', lineHeight: '1.8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>🔴 Active Threats:</span>
                  <span style={{ color: missiles.filter(m => m.active).length > 0 ? '#ff0000' : matrixGreen }}>
                    {missiles.filter(m => m.active).length}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>🔵 Interceptors:</span>
                  <span style={{ color: glowGreen }}>{interceptors.filter(i => i.active).length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>📊 Success Rate:</span>
                  <span style={{ color: glowGreen }}>
                    {((ironDome.trackingAccuracy * 100).toFixed(0))}%
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>🎯 Available:</span>
                  <span>{ironDome.maxInterceptors - interceptors.filter(i => i.active).length}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '12px', 
                color: glowGreen,
                textShadow: `0 0 5px ${glowGreen}`
              }}>
                RADAR STATUS
              </h3>
              <div style={{ fontSize: '10px', lineHeight: '1.8' }}>
                <div>Detection: {ironDome.detectionRadius}km</div>
                <div>Range: {ironDome.radarRange}km</div>
                <div>Status: {running ? '🟢 SCANNING' : '⏸️ STANDBY'}</div>
              </div>
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

            <div>
              <h3 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '12px', 
                color: glowGreen,
                textShadow: `0 0 5px ${glowGreen}`
              }}>
                CONTROLS GUIDE
              </h3>
              <div style={{ fontSize: '10px', lineHeight: '1.8', opacity: 0.8 }}>
                <div>🖱️ Left Click: Rotate</div>
                <div>🖱️ Right Click: Pan</div>
                <div>🖱️ Scroll: Zoom</div>
                <div>⌨️ Tab: Switch Views</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}



