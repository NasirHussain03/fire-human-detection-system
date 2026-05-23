import { useState, useRef, useCallback } from 'react'
import { Upload as UploadIcon, Image, Film, X, Loader, AlertCircle } from 'lucide-react'
import { detectImage, detectVideo, API_URL } from '../lib/api'
import DetectionResult from '../components/DetectionResult'

const ACCEPT = { image: '.jpg,.jpeg,.png,.bmp,.webp', video: '.mp4,.avi,.mov,.mkv,.webm' }
const LABELS  = { image: 'JPG, PNG, WEBP, BMP', video: 'MP4, AVI, MOV, MKV, WEBM' }

export default function Upload() {
  const [tab, setTab]         = useState('image')
  const [file, setFile]       = useState(null)
  const [preview, setPreview] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState(null)
  const inputRef = useRef()

  const handleFile = (f) => {
    if (!f) return
    setFile(f); setResult(null); setError(null); setProgress(0)
    setPreview(tab === 'image' ? URL.createObjectURL(f) : null)
  }

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0])
  }, [tab])

  const onSubmit = async () => {
    if (!file) return
    setLoading(true); setError(null); setResult(null)
    try {
      const fn  = tab === 'image' ? detectImage : detectVideo
      const res = await fn(file, setProgress)
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.error ?? `Detection failed. Ensure the backend is running at ${API_URL || 'port 5000'}.`)
    } finally { setLoading(false) }
  }

  const reset = () => { setFile(null); setPreview(null); setResult(null); setError(null); setProgress(0) }

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      <div className="container" style={{ maxWidth: 720 }}>

        {/* Page header */}
        <div style={{ marginBottom: 40 }}>
          <p className="section-label">Detection</p>
          <h1 style={{ fontSize: 32, fontWeight: 750, color: 'var(--text)', letterSpacing: '-0.02em' }}>Upload &amp; Analyse</h1>
          <p style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 6 }}>
            Upload an image or video to run fire and human detection
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--bg-card)',
                      borderRadius: 12, border: '1px solid var(--border)', width: 'fit-content', marginBottom: 28 }}>
          {[{ id:'image', label:'Image', icon: Image }, { id:'video', label:'Video', icon: Film }].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setTab(id); reset() }}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 20px', borderRadius: 9, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600,
                transition: 'all 0.15s',
                background: tab === id ? 'var(--bg-raised)' : 'transparent',
                color: tab === id ? 'var(--text)' : 'var(--text-3)',
              }}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            cursor: 'pointer', borderRadius: 16, padding: 40, textAlign: 'center',
            marginBottom: 20, transition: 'all 0.2s',
            background: dragging ? 'rgba(239,68,68,0.04)' : 'var(--bg-card)',
            border: `2px dashed ${dragging ? '#EF4444' : file ? 'rgba(34,197,94,0.4)' : 'var(--border-hi)'}`,
          }}>
          <input ref={inputRef} type="file" accept={ACCEPT[tab]} style={{ display:'none' }}
                 onChange={e => handleFile(e.target.files[0])} />

          {preview ? (
            <div>
              <img src={preview} alt="preview"
                   style={{ maxHeight: 280, maxWidth: '100%', borderRadius: 10, objectFit: 'contain', margin: '0 auto 14px', display: 'block' }} />
              <p style={{ fontSize: 13, color: '#22C55E', fontWeight: 600 }}>{file.name}</p>
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{(file.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
          ) : file ? (
            <div style={{ padding: '20px 0' }}>
              <Film size={44} color="#22C55E" style={{ margin: '0 auto 14px', display: 'block' }} />
              <p style={{ fontWeight: 600, color: '#22C55E', marginBottom: 4 }}>{file.name}</p>
              <p style={{ fontSize: 13, color: 'var(--text-3)' }}>{(file.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
          ) : (
            <div style={{ padding: '24px 0' }}>
              <UploadIcon size={40} color="var(--text-3)" style={{ margin: '0 auto 16px', display: 'block' }} />
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                Drop {tab} here or click to browse
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-3)' }}>{LABELS[tab]}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button className="btn-primary" onClick={onSubmit} disabled={!file || loading}
                  style={{ flex: 1, justifyContent: 'center', fontSize: 14 }}>
            {loading
              ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Processing{progress > 0 ? ` ${progress}%` : '…'}</>
              : <><UploadIcon size={15} /> Run Detection</>}
          </button>
          {file && (
            <button onClick={reset} className="btn-ghost" style={{ padding: '12px 16px' }}><X size={16} /></button>
          )}
        </div>

        {/* Progress */}
        {loading && progress > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ height: 3, borderRadius: 99, background: 'var(--bg-raised)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#EF4444,#F59E0B)',
                            transition: 'width 0.3s', borderRadius: 99 }} />
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 5, textAlign: 'right' }}>Uploading {progress}%</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 18px', borderRadius: 12, marginBottom: 20,
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertCircle size={16} color="#EF4444" style={{ marginTop: 2, flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: '#FCA5A5' }}>{error}</p>
          </div>
        )}

        {/* Result */}
        {result && <DetectionResult result={result} outputFile={result.output_file} />}
      </div>
    </div>
  )
}
