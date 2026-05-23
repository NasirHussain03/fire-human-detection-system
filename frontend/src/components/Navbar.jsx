import { NavLink } from 'react-router-dom'
import { Flame, Upload, Monitor, LayoutDashboard, Clock, Info } from 'lucide-react'

const links = [
  { to: '/',           label: 'Home',         icon: Flame           },
  { to: '/upload',     label: 'Upload',       icon: Upload          },
  { to: '/live',       label: 'Live Monitor', icon: Monitor         },
  { to: '/dashboard',  label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/history',    label: 'History',      icon: Clock           },
  { to: '/about',      label: 'About',        icon: Info            },
]

export default function Navbar() {
  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(10,15,30,0.8)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: 64, gap: 40 }}>

        {/* Logo */}
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'linear-gradient(135deg, #EF4444 0%, #F59E0B 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Flame size={17} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#F1F5F9', lineHeight: 1 }}>FireGuard AI</p>
            <p style={{ fontSize: 11, color: '#475569', lineHeight: 1, marginTop: 2 }}>Detection System</p>
          </div>
        </NavLink>

        {/* Nav links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 8,
                fontSize: 13, fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.15s',
                color: isActive ? '#F1F5F9' : '#64748B',
                background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
              })}
            >
              <Icon size={14} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
          <span className="pulse-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', display: 'block' }} />
          <span style={{ fontSize: 12, color: '#475569' }}>System Online</span>
        </div>
      </div>
    </header>
  )
}
