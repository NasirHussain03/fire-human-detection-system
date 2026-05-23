import { useState, useEffect } from 'react'
import { Activity, Flame, Users, ShieldAlert, CheckCircle, Server, TrendingUp } from 'lucide-react'
import { StatusBadge } from '../components/DetectionResult'
import { healthCheck } from '../lib/api'

const METRICS = [
  { icon: Activity,    label: 'Total Detections',   value: 142, color: '#3B82F6' },
  { icon: Flame,       label: 'Fire Events',          value: 38,  color: '#EF4444' },
  { icon: Users,       label: 'Person Detections',    value: 97,  color: '#F59E0B' },
  { icon: ShieldAlert, label: 'High Risk Alerts',     value: 21,  color: '#EF4444' },
  { icon: CheckCircle, label: 'Safe Scenes',           value: 84,  color: '#22C55E' },
  { icon: TrendingUp,  label: 'Avg. Fire Confidence', value: '73%',color: '#8B5CF6' },
]

const RECENT = [
  { id:1, file:'warehouse_cam.mp4', time:'2 min ago',  status:'HIGH RISK',       fire:true,  persons:2 },
  { id:2, file:'kitchen_fire.jpg',  time:'11 min ago', status:'FIRE ONLY',        fire:true,  persons:0 },
  { id:3, file:'office_lobby.jpg',  time:'23 min ago', status:'PERSON DETECTED',  fire:false, persons:3 },
  { id:4, file:'parking_lot.mp4',   time:'1 hr ago',   status:'SAFE',             fire:false, persons:0 },
  { id:5, file:'server_room.jpg',   time:'2 hr ago',   status:'HIGH RISK',       fire:true,  persons:1 },
]

export default function Dashboard() {
  const [backendOk, setBackendOk] = useState(null)

  useEffect(() => {
    healthCheck().then(() => setBackendOk(true)).catch(() => setBackendOk(false))
  }, [])

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      <div className="container">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 48 }}>
          <div>
            <p className="section-label">Overview</p>
            <h1 style={{ fontSize: 32, fontWeight: 750, color: 'var(--text)', letterSpacing: '-0.02em' }}>Dashboard</h1>
            <p style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 6 }}>System analytics and detection summary</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10,
                        background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <Server size={13} color={backendOk === true ? '#22C55E' : backendOk === false ? '#EF4444' : '#F59E0B'} />
            <span style={{ fontSize: 12, fontWeight: 600,
                           color: backendOk === true ? '#22C55E' : backendOk === false ? '#EF4444' : 'var(--text-3)' }}>
              {backendOk === null ? 'Checking…' : backendOk ? 'Backend Online' : 'Backend Offline'}
            </span>
          </div>
        </div>

        {/* Metric grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 40 }}>
          {METRICS.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="card" style={{ padding: '24px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>{label}</p>
                <div style={{ width: 32, height: 32, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
                  <Icon size={14} color={color} />
                </div>
              </div>
              <p style={{ fontSize: 34, fontWeight: 800, color, lineHeight: 1 }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Fire rate */}
        <div className="card" style={{ marginBottom: 32, padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 650, color: 'var(--text)', marginBottom: 2 }}>Fire Detection Rate</p>
              <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Percentage of uploads containing fire</p>
            </div>
            <span style={{ fontSize: 24, fontWeight: 800, color: '#EF4444' }}>26.8%</span>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: 'var(--bg-raised)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '26.8%', background: 'linear-gradient(90deg,#EF4444,#F59E0B)',
                          borderRadius: 99, transition: 'width 1s ease' }} />
          </div>
        </div>

        {/* Recent detections */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontSize: 15, fontWeight: 650, color: 'var(--text)' }}>Recent Detections</p>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['File', 'Time', 'Fire', 'Persons', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 24px', textAlign: 'left', fontSize: 11,
                                       fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT.map(({ id, file, time, status, fire, persons }) => (
                <tr key={id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <td style={{ padding: '14px 24px' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{file}</p>
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{time}</p>
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    {fire ? <Flame size={14} color="#EF4444" /> : <span style={{ fontSize: 12, color: 'var(--text-3)' }}>—</span>}
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: persons > 0 ? '#F59E0B' : 'var(--text-3)' }}>
                      {persons > 0 ? persons : '—'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <StatusBadge status={status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
