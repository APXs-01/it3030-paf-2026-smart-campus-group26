import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import NotificationPanel from './NotificationPanel'

function UserAvatar({ user }) {
  const [imgError, setImgError] = useState(false)
  if (user?.picture && !imgError) {
    return (
      <img
        src={user.picture}
        alt={user.name}
        className="avatar"
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
      />
    )
  }
  return <div className="avatar-placeholder">{user?.name?.[0]?.toUpperCase()}</div>
}

const NAV_LINKS = (isAdmin, isTechnician) => [
  { to: '/resources',   label: 'Resources',   icon: '🏢' },
  { to: '/bookings',    label: 'Bookings',    icon: '📅' },
  { to: '/tickets',     label: 'Tickets',     icon: '🎫' },
  ...(isTechnician && !isAdmin ? [{ to: '/technician', label: 'My Work', icon: '🔧' }] : []),
  ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: '⚙️' }] : []),
]

export default function Navbar({ transparent }) {
  const { user, logout, isAdmin, isTechnician } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef(null)

  const isActive = (path) => location.pathname.startsWith(path) ? 'active' : ''
  const links = NAV_LINKS(isAdmin(), isTechnician())

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    // Trigger once on mount
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const h = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  // Close mobile nav on route change
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const handleLogout = () => { setMenuOpen(false); logout(); navigate('/login') }
  const navClass = `navbar ${transparent && !scrolled ? 'navbar-transparent' : ''}`
  return (
    <>
      <nav className={navClass}>
        {/* Brand */}
        <div className="navbar-brand">
          <Link to="/dashboard">
            <div className="brand-icon">🏫</div>
            <span>SmartCampus</span>
          </Link>
        </div>

        {/* Desktop links */}
        <div className="navbar-links">
          {links.map(l => (
            <Link key={l.to} to={l.to} className={isActive(l.to)}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="navbar-right">
          <NotificationPanel />

          {/* User menu */}
          <div className="user-menu" ref={dropdownRef}>
            <div className="user-trigger" onClick={() => setMenuOpen(o => !o)}>
              <UserAvatar user={user} />
              <span className="user-name">{user?.name?.split(' ')[0]}</span>
              <span className={`chevron ${menuOpen ? 'open' : ''}`}>▾</span>
            </div>

            {menuOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-info">
                  <strong>{user?.name}</strong>
                  <small>{user?.email}</small>
                  <span className="role-badge">{user?.role}</span>
                </div>
                <div className="dropdown-divider" />
                <Link to="/profile" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                  👤 My Profile
                </Link>
                <Link to="/dashboard" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                  🏠 Dashboard
                </Link>
                <Link to="/tickets/new" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                  🎫 Report Issue
                </Link>
                <Link to="/settings" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                  ⚙️ Settings
                </Link>
                <div className="dropdown-divider" />
                <button className="dropdown-item danger" onClick={handleLogout}>
                  ↩ Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Hamburger */}
          <button
            className={`nav-hamburger ${mobileOpen ? 'open' : ''}`}
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)}>
        <div className="mobile-nav-inner" onClick={e => e.stopPropagation()}>
          {links.map(l => (
            <Link key={l.to} to={l.to} className={isActive(l.to)}>
              <span>{l.icon}</span> {l.label}
            </Link>
          ))}
          <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '11px 14px', borderRadius: 'var(--radius)',
                background: '#fff5f5', color: 'var(--danger)',
                border: 'none', font: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer'
              }}
            >
              ↩ Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
