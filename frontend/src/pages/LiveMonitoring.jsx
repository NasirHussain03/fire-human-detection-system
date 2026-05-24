import { useState, useRef, useEffect } from 'react'
import { Monitor, Play, StopCircle, Wifi, WifiOff, Camera } from 'lucide-react'
import { API_URL, detectImage } from '../lib/api'
import { StatusBadge } from '../components/DetectionResult'

export default function LiveMonitoring() {
  const [streaming, setStreaming] = useState(false)
  const [error, setError]         = useState(null)
  const [result, setResult]       = useState(null)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const imgRef = useRef(null)
  const streamRef = useRef(null)
  const loopRef = useRef(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loopRef.current) clearTimeout(loopRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const start = async () => {
    setError(null)
    setResult(null)
    try {
      console.log("[LiveMonitoring] Requesting webcam access...")
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 360 } }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setStreaming(true)
      console.log("[LiveMonitoring] Webcam stream active.")
    } catch (err) {
      console.error(err)
      setError('Cannot access webcam. Please ensure camera permissions are granted.')
    }
  }

  // Effect to manage processing loop when streaming state changes
  useEffect(() => {
    if (streaming) {
      // Small delay to allow webcam to warm up
      loopRef.current = setTimeout(processFrameLoop, 500)
    } else {
      if (loopRef.current) {
        clearTimeout(loopRef.current)
        loopRef.current = null
      }
    }
  }, [streaming])

  const processFrameLoop = () => {
    if (!videoRef.current || !canvasRef.current || !imgRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      // Draw video frame to hidden canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Convert frame to Blob and upload
      canvas.toBlob(async (blob) => {
        if (!blob) {
          loopRef.current = setTimeout(processFrameLoop, 100)
          return
        }

        try {
          const file = new File([blob], 'webcam.jpg', { type: 'image/jpeg' })
          const res = await detectImage(file)
          
          if (res.data && res.data.success) {
            setResult(res.data)
            if (imgRef.current) {
              imgRef.current.src = `${API_URL}/outputs/${res.data.output_file}?t=${Date.now()}`
            }
          }
        } catch (err) {
          console.error('[LiveMonitoring] Error sending frame to detection API:', err)
        }

        // Schedule next frame processing
        // We do this sequentially to prevent overloading the server with requests
        loopRef.current = setTimeout(processFrameLoop, 200)
      }, 'image/jpeg', 0.7)
    } else {
      // Webcam feed is active but frame is not ready yet
      loopRef.current = setTimeout(processFrameLoop, 100)
    }
  }

  const stop = () => {
    setStreaming(false)
    setResult(null)
    if (loopRef.current) {
      clearTimeout(loopRef.current)
      loopRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    if (imgRef.current) {
      imgRef.current.src = ''
    }
    console.log("[LiveMonitoring] Webcam stream stopped.")
  }

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      <div className="container">

        {/* Hidden video and canvas elements for webcam capture */}
        <video ref={videoRef} style={{ display: 'none' }} playsInline muted />
        <canvas ref={canvasRef} style={{ display: 'none' }} width={640} height={360} />

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
              aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <img ref={imgRef} alt="Live feed" style={{ width:'100%', height:'100%', objectFit:'contain', display: (streaming && result) ? 'block' : 'none' }} />

              {/* Offline placeholder */}
              {!streaming && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--bg-raised)',
                                border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Camera size={28} color="var(--text-3)" />
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-3)' }}>Stream not started</p>
                </div>
              )}

              {/* Loading / initializing placeholder */}
              {streaming && !result && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 24, textAlign: 'center' }}>
                  <div className="pulse-dot" style={{ width: 12, height: 12, borderRadius: '50%', background: '#EF4444' }} />
                  <p style={{ fontSize: 14, color: 'var(--text-2)', maxWidth: 320 }}>
                    Initializing camera feed & preloading remote AI models. This may take up to 10 seconds...
                  </p>
                </div>
              )}

              {/* LIVE badge */}
              {streaming && result && (
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
            {/* Real-time stats display */}
            {result && (
              <div className="card" style={{ padding: '20px', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                  Current Detection
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Status:</span>
                    <StatusBadge status={result.status} size="sm" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Fire Conf:</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: result.fire_detected ? '#EF4444' : '#22C55E' }}>
                      {(result.fire_confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-2)' }}>People:</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: result.person_count > 0 ? '#F59E0B' : 'var(--text)' }}>
                      {result.person_count}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="card" style={{ padding: '20px' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Pipeline</p>
              {['Capture frame (Browser)', 'CNN fire prediction (Cloud)', 'YOLOv8 person detection (Cloud)', 'Decision engine (Cloud)', 'Render annotated frame'].map((step, i) => (
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
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Deployment Status</p>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65 }}>
                Webcam frames are captured client-side and sent directly to the Hugging Face Space backend (CPU) for inference. This allows real-time live monitoring to work securely and natively from any browser.
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
