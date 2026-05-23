import { useState } from 'react'
import { Search, Filter, Flame } from 'lucide-react'
import { StatusBadge } from '../components/DetectionResult'

const ALL = [
  { id:1, file:'warehouse_cam.mp4',  type:'video', date:'2026-05-23 18:42', status:'HIGH RISK',       fire:true,  persons:3, conf:0.97 },
  { id:2, file:'kitchen_fire.jpg',   type:'image', date:'2026-05-23 17:15', status:'FIRE ONLY',        fire:true,  persons:0, conf:0.91 },
  { id:3, file:'office_lobby.jpg',   type:'image', date:'2026-05-23 16:03', status:'PERSON DETECTED',  fire:false, persons:2, conf:0.12 },
  { id:4, file:'parking_lot.mp4',    type:'video', date:'2026-05-23 14:50', status:'SAFE',             fire:false, persons:0, conf:0.05 },
  { id:5, file:'server_room.jpg',    type:'image', date:'2026-05-23 13:30', status:'HIGH RISK',       fire:true,  persons:1, conf:0.88 },
  { id:6, file:'rooftop_stream.mp4', type:'video', date:'2026-05-23 12:10', status:'FIRE ONLY',        fire:true,  persons:0, conf:0.83 },
  { id:7, file:'corridor_1.jpg',     type:'image', date:'2026-05-23 11:00', status:'SAFE',             fire:false, persons:0, conf:0.03 },
  { id:8, file:'exit_camera.mp4',    type:'video', date:'2026-05-23 09:45', status:'PERSON DETECTED',  fire:false, persons:5, conf:0.08 },
]

const FILTERS = ['All', 'HIGH RISK', 'FIRE ONLY', 'PERSON DETECTED', 'SAFE']

const typeColors = { video: { bg:'rgba(139,92,246,0.1)', color:'#8B5CF6' }, image: { bg:'rgba(59,130,246,0.1)', color:'#3B82F6' } }

export default function History() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  const rows = ALL.filter(r =>
    (filter === 'All' || r.status === filter) &&
    r.file.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      <div className="container">

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p className="section-label">Audit Log</p>
          <h1 style={{ fontSize: 32, fontWeight: 750, color: 'var(--text)', letterSpacing: '-0.02em' }}>Detection History</h1>
          <p style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 6 }}>All past detection records and results</p>
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <Search size={14} color="var(--text-3)"
                    style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input className="input" placeholder="Search files…"
                   value={search} onChange={e => setSearch(e.target.value)}
                   style={{ paddingLeft: 38 }} />
          </div>

          {/* Filter pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={13} color="var(--text-3)" />
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                transition: 'all 0.15s',
                background: filter === f ? 'var(--fire)' : 'var(--bg-card)',
                color: filter === f ? '#fff' : 'var(--text-3)',
                borderWidth: 1, borderStyle: 'solid',
                borderColor: filter === f ? 'transparent' : 'var(--border)',
              }}>{f}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['File', 'Type', 'Date', 'Status', 'Fire', 'People', 'Confidence'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11,
                                       fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: 'var(--text-3)', fontSize: 14 }}>
                  No records match your filter
                </td></tr>
              )}
              {rows.map(({ id, file, type, date, status, fire, persons, conf }) => {
                const tc = typeColors[type]
                return (
                  <tr key={id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s', cursor: 'default' }}
                      onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <td style={{ padding: '14px 20px' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{file}</p>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
                                     background: tc.bg, color: tc.color }}>
                        {type}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{date}</p>
                    </td>
                    <td style={{ padding: '14px 20px' }}><StatusBadge status={status} /></td>
                    <td style={{ padding: '14px 20px' }}>
                      {fire ? <Flame size={14} color="#EF4444" /> : <span style={{ color: 'var(--text-3)', fontSize: 13 }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: persons > 0 ? '#F59E0B' : 'var(--text-3)' }}>
                        {persons > 0 ? persons : '—'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 4, borderRadius: 99, background: 'var(--bg-raised)', overflow:'hidden' }}>
                          <div style={{ height: '100%', width: `${conf * 100}%`, borderRadius: 99,
                                        background: fire ? '#EF4444' : '#22C55E' }} />
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-3)', width: 32 }}>{(conf * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Showing {rows.length} of {ALL.length} records</p>
          </div>
        </div>

      </div>
    </div>
  )
}
