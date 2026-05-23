import { Flame, Users, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react'
import { API_URL } from '../lib/api'

const statusCfg = {
  'HIGH RISK':       { bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.3)',  text: '#EF4444', dot: '#EF4444'  },
  'FIRE ONLY':       { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: '#F59E0B', dot: '#F59E0B'  },
  'PERSON DETECTED': { bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.3)',  text: '#22C55E', dot: '#22C55E'  },
  'SAFE':            { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)',  text: '#22C55E', dot: '#22C55E'  },
}

export function StatusBadge({ status, size = 'sm' }) {
  const c = statusCfg[status] ?? statusCfg['SAFE']
  const pad = size === 'lg' ? '7px 16px' : '4px 11px'
  const fs  = size === 'lg' ? 13 : 11
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: pad, borderRadius: 99, fontSize: fs, fontWeight: 600,
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, display: 'block',
                     animation: status === 'HIGH RISK' ? 'pulse-dot 1.2s ease infinite' : 'none' }} />
      {status}
    </span>
  )
}

export default function DetectionResult({ result, outputFile }) {
  if (!result) return null
  const { status, fire_detected, fire_confidence, person_count, severity } = result
  const firePercent = (fire_confidence * 100).toFixed(1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Status row */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px' }}>
        <div>
          <p style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Detection Result
          </p>
          <StatusBadge status={status} size="lg" />
        </div>
        {severity === 3 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 10,
                        background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <AlertTriangle size={15} color="#EF4444" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#EF4444' }}>EMERGENCY ALERT</span>
          </div>
        )}
      </div>

      {/* Metric grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        {[
          { icon: Flame,       label: 'Fire',     value: fire_detected ? 'Detected' : 'None', sub: `${firePercent}% confidence`, color: fire_detected ? '#EF4444' : '#22C55E' },
          { icon: Users,       label: 'Persons',  value: person_count, sub: `${person_count} detected`, color: person_count > 0 ? '#F59E0B' : '#22C55E' },
          { icon: severity >= 2 ? ShieldAlert : CheckCircle, label: 'Severity', value: `Level ${severity}`, sub: 'out of 3', color: severity >= 3 ? '#EF4444' : severity >= 2 ? '#F59E0B' : '#22C55E' },
        ].map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
            <Icon size={18} color={color} style={{ margin: '0 auto 10px' }} />
            <p style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</p>
            <p style={{ fontSize: 20, fontWeight: 700, color, lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Output file */}
      {outputFile && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10,
                        background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <CheckCircle size={14} color="#3B82F6" />
            <p style={{ fontSize: 12, color: '#93C5FD' }}>
              Annotated output saved: <code style={{ fontFamily: 'monospace' }}>{outputFile}</code>
            </p>
          </div>
          <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
            <img src={`${API_URL}/outputs/${outputFile}`} alt="Annotated detection output"
                 style={{ width: '100%', maxHeight: 400, objectFit: 'contain', display: 'block' }} />
          </div>
        </div>
      )}
    </div>
  )
}
