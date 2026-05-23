import { useState, useRef } from 'react'
import { Monitor, Play, StopCircle, Wifi, WifiOff, Camera } from 'lucide-react'
import { API_URL } from '../lib/api'

export default function LiveMonitoring() {
  const [streaming, setStreaming] = useState(false)
  const [error, setError]         = useState(null)
  const imgRef = useRef()

  const start = () => {
    setError(null); setStreaming(true)
    if (imgRef.current) {
      imgRef.current.src = `${API_URL}/api/detect/stream?t=${Date.now()}`
      imgRef.current.onerror = () => {
        setError('Cannot connect to stream. Ensure the backend is running and a webcam is connected.')
        setStreaming(false)
      }
    }
  }

  const stop = async () => {
    if (imgRef.current) imgRef.current.src = ''
    setStreaming(false)
    try { await fetch(`${API_URL}/api/detect/stream/stop`, { method: 'POST' }) } catch (_) {}
  }

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      <div className="container">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 40 }}>
          <div>
            <p className="section-label">Webcam</p>
            <h1 style={{ fontSize: 32, fontWeight: 750, color: 'var(--text)', letterSpacing: '-0.02em' }}>Live Monitoring</h1>
            <p style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 6 }}>Real-time fire and human detection from your webcam</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 16px', borderRadius: 10,
                        background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            {streaming
              ? <><Wifi size={13} color="#22C55E" /><span style={{ fontSize: 12, color: '#22C55E', fontWeight: 600 }}>Streaming</span></>
              : <><WifiOff size={13} color="var(--text-3)" /><span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>Offline</span></>
            }
          </div>
        </div>

        {/* Main layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>

          {/* Video viewport */}
          <div>
            <div style={{
              position: 'relative', borderRadius: 16, overflow: 'hidden',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              aspectRatio: '16/9',
            }}>
              <img ref={imgRef} alt="Live feed" style={{ width:'100%', height:'100%', objectFit:'contain', display: streaming ? 'block' : 'none' }} />

              {/* Offline placeholder */}
              {!streaming && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                              alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--bg-raised)',
                                border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Camera size={28} color="var(--text-3)" />
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-3)' }}>Stream not started</p>
                </div>
              )}

              {/* LIVE badge */}
              {streaming && (
                <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', alignItems: 'center', gap: 6,
                              padding: '5px 12px', borderRadius: 99, background: 'rgba(239,68,68,0.9)' }}>
                  <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', display: 'block' }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.08em' }}>LIVE</span>
                </div>
              )}
            </div>

            {/* Controls below video */}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              {!streaming
                ? <button onClick={start} className="btn-primary" style={{ fontSize: 14 }}>
                    <Play size={15} fill="currentColor" /> Start Stream
                  </button>
                : <button onClick={stop}
                    style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'12px 24px', borderRadius:10,
                             border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.08)',
                             color:'#EF4444', fontWeight:600, fontSize:14, cursor:'pointer' }}>
                    <StopCircle size={15} /> Stop Stream
                  </button>
              }
            </div>
          </div>

          {/* Info panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ padding: '20px' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Pipeline</p>
              {['Capture frame (OpenCV)', 'CNN fire prediction', 'YOLOv8 person detection', 'Decision engine', 'Annotate & stream MJPEG'].map((step, i) => (
                <div key={step} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: i < 4 ? 14 : 0 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 7, background: 'var(--bg-raised)',
                                border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 11, fontWeight: 700, color: 'var(--text-3)', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', paddingTop: 2 }}>{step}</p>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Note</p>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65 }}>
                Requires a webcam connected to the server and the Flask backend running on port 5000.
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginTop: 20, padding: '14px 18px', borderRadius: 12,
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p style={{ fontSize: 13, color: '#FCA5A5' }}>{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
