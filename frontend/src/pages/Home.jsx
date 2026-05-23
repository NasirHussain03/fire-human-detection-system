import { Link } from 'react-router-dom'
import { Flame, Upload, Monitor, Brain, Eye, Zap, ShieldCheck, ArrowRight } from 'lucide-react'

const stats = [
  { value: '91.96%', label: 'Fire Detection Accuracy' },
  { value: 'YOLOv8', label: 'Human Detection'         },
  { value: '<50ms',  label: 'Per-frame Inference'     },
  { value: '3',      label: 'Risk Severity Levels'    },
]

const features = [
  { icon: Brain,      title: 'CNN Fire Classifier',  desc: 'TensorFlow/Keras model trained on 755 real fire images. Achieves 91.96% validation accuracy.' },
  { icon: Eye,        title: 'YOLOv8 Human Tracking',desc: 'Pretrained YOLO model detects people in every frame with precise bounding boxes.' },
  { icon: Zap,        title: 'Instant Risk Scoring',  desc: 'Decision engine maps detection results to SAFE, FIRE ONLY, or HIGH RISK in milliseconds.' },
  { icon: ShieldCheck,'title': 'Annotated Output',   desc: 'Color-coded overlays drawn on every frame and saved to output video or image files.' },
]

export default function Home() {
  return (
    <div style={{ background: 'var(--bg)' }}>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section style={{ padding: '120px 0 80px' }}>
        <div className="container" style={{ maxWidth: 780, textAlign: 'center' }}>
          <div className="anim-fade-up" style={{ animationDelay: '0s' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '5px 14px', borderRadius: 99,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#EF4444', fontSize: 12, fontWeight: 600,
              marginBottom: 32,
            }}>
              <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} />
              AI-Powered Emergency Detection
            </span>
          </div>

          <h1 className="anim-fade-up" style={{
            animationDelay: '0.08s',
            fontSize: 52, fontWeight: 800, lineHeight: 1.15,
            color: 'var(--text)', marginBottom: 20, letterSpacing: '-0.02em',
          }}>
            Fire & Human{' '}
            <span style={{ color: '#EF4444' }}>Detection</span>{' '}
            System
          </h1>

          <p className="anim-fade-up" style={{
            animationDelay: '0.14s',
            fontSize: 17, color: 'var(--text-2)', lineHeight: 1.75,
            marginBottom: 44, maxWidth: 580, margin: '0 auto 44px',
          }}>
            Upload images, videos, or stream live footage to instantly identify
            fire hazards and detect people in high-risk environments.
          </p>

          <div className="anim-fade-up" style={{ animationDelay: '0.2s', display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/upload" className="btn-primary" style={{ fontSize: 15 }}>
              <Upload size={16} /> Start Detection
            </Link>
            <Link to="/live" className="btn-ghost" style={{ fontSize: 15 }}>
              <Monitor size={16} /> Live Monitor <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────── */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
            {stats.map(({ value, label }, i) => (
              <div key={label} className="card anim-fade-up"
                   style={{ animationDelay: `${0.1 * i}s`, textAlign: 'center', padding: '28px 20px' }}>
                <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>{value}</p>
                <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section style={{ padding: '0 0 100px' }}>
        <div className="container">
          <p className="section-label" style={{ textAlign: 'center', marginBottom: 12 }}>How It Works</p>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', textAlign: 'center', marginBottom: 48 }}>
            Four-stage detection pipeline
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {features.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="card anim-fade-up"
                   style={{ animationDelay: `${0.08 * i}s`, display: 'flex', gap: 18, padding: '28px 24px' }}>
                <div style={{
                  flexShrink: 0, width: 42, height: 42, borderRadius: 12,
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={19} color="#EF4444" />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 650, color: 'var(--text)', marginBottom: 6 }}>{title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
