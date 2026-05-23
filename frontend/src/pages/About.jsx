import { Flame, Brain, Eye, Layers, Database, Cpu } from 'lucide-react'

const stack = [
  { icon: Brain,    label: 'TensorFlow / Keras', tag: 'v2.21',    desc: 'CNN fire classifier — 91.96% validation accuracy on 999 real fire images.' },
  { icon: Eye,      label: 'Ultralytics YOLOv8', tag: 'v8.4',     desc: 'Pretrained COCO model. Class 0 (person) detected per-frame with bounding boxes.' },
  { icon: Cpu,      label: 'OpenCV',              tag: 'v4.13',    desc: 'Frame capture, JPEG encoding, annotation drawing, and video I/O pipeline.' },
  { icon: Flame,    label: 'Flask + CORS',        tag: 'v3.1',     desc: 'REST API backend with MJPEG streaming and MongoDB Atlas integration.' },
  { icon: Layers,   label: 'React + Vite',        tag: 'v19 / v8', desc: 'Frontend SPA with React Router, Axios uploads, and Tailwind CSS v4.' },
  { icon: Database, label: 'MongoDB Atlas',       tag: 'Cloud',    desc: 'Cloud database storing detection events, metadata and output references.' },
]

const arch = [
  { title: 'CNN Architecture',   detail: 'Input(128²) → Conv2D(32) → MaxPool → Conv2D(64) → MaxPool → Conv2D(128) → MaxPool → Dense(256) → Sigmoid' },
  { title: 'Decision Logic',     detail: 'Fire ∧ Person → HIGH RISK  |  Fire only → FIRE ONLY  |  Person only → PERSON DETECTED  |  Neither → SAFE' },
  { title: 'Video Pipeline',     detail: 'Read frame (OpenCV) → Fire CNN every 5 frames → YOLO every frame → Annotate → Write output video' },
  { title: 'Frame Annotation',   detail: 'Red border tint = fire detected  |  Green bbox = person  |  Top banner = risk status + confidence' },
]

export default function About() {
  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      <div className="container" style={{ maxWidth: 860 }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, margin: '0 auto 20px',
                        background: 'linear-gradient(135deg,#EF4444,#F59E0B)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Flame size={30} color="#fff" />
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 14 }}>
            About FireGuard AI
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-2)', lineHeight: 1.75, maxWidth: 560, margin: '0 auto' }}>
            An end-to-end fire and human detection system that combines deep learning
            with a real-time annotated video pipeline and a modern emergency monitoring interface.
          </p>
        </div>

        {/* Tech stack */}
        <div style={{ marginBottom: 64 }}>
          <p className="section-label">Built With</p>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>Technology Stack</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {stack.map(({ icon: Icon, label, tag, desc }) => (
              <div key={label} className="card" style={{ display: 'flex', gap: 16, padding: '22px 20px' }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                              background: 'var(--bg-raised)', border: '1px solid var(--border)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} color="#EF4444" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <p style={{ fontSize: 14, fontWeight: 650, color: 'var(--text)' }}>{label}</p>
                    <span style={{ fontSize: 11, padding: '1px 8px', borderRadius: 99, background: 'var(--bg-raised)',
                                   border: '1px solid var(--border)', color: 'var(--text-3)', fontWeight: 600 }}>{tag}</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture */}
        <div style={{ marginBottom: 64 }}>
          <p className="section-label">System Design</p>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>Architecture Details</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {arch.map(({ title, detail }) => (
              <div key={title} className="card" style={{ display: 'flex', gap: 20, padding: '20px 24px' }}>
                <div style={{ width: 3, borderRadius: 99, background: '#EF4444', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 650, color: 'var(--text)', marginBottom: 5 }}>{title}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65, fontFamily: 'monospace' }}>{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '32px', borderRadius: 16,
                      background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 6 }}>
            Python 3.12 &nbsp;·&nbsp; TensorFlow 2.21 &nbsp;·&nbsp; YOLOv8 &nbsp;·&nbsp; Flask &nbsp;·&nbsp; React &nbsp;·&nbsp; Tailwind CSS
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>FireGuard AI &copy; 2026</p>
        </div>

      </div>
    </div>
  )
}
