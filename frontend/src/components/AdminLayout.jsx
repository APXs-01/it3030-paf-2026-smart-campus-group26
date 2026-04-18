import { NavLink } from 'react-router-dom'

const ICONS = {
  Dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
  Bookings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
  Checkin: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
  Tickets: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
  Users: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  AddResource: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
}

const ADMIN_LINKS = [
  { to: '/admin/dashboard',     icon: ICONS.Dashboard, label: 'Dashboard', subLinks: [] },
  { to: '/admin/bookings',      icon: ICONS.Bookings,  label: 'Bookings', subLinks: ['Active Bookings', 'Pending Requests', 'History'] },
  { to: '/admin/checkin',       icon: ICONS.Checkin,   label: 'Check-in', subLinks: [] },
  { to: '/admin/tickets',       icon: ICONS.Tickets,   label: 'Tickets', subLinks: ['Active Tickets', 'Closed Issues'] },
  { to: '/admin/users',         icon: ICONS.Users,     label: 'Users', subLinks: [] },
  { to: '/admin/resources/new', icon: ICONS.AddResource, label: 'Resources', subLinks: [] },
]

export default function AdminLayout({ children }) {
  
  return (
    <div>
      <div style={{
        display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 4,
        marginBottom: 20, borderBottom: '1px solid var(--border)',
      }} className="admin-tabs">
        {ADMIN_LINKS.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 'var(--radius)',
              fontSize: 13, fontWeight: isActive ? 700 : 500,
              color: isActive ? '#111827' : '#64748b',
              background: isActive ? '#dcf628' : 'transparent',
              textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
              transition: 'all 0.13s',
            })}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>{l.icon}</span> {l.label}
          </NavLink>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        
        {/* Light Sidebar styled EXACTLY like reference image but in white! */}
        <aside className="admin-sidebar" style={{
          width: 250, flexShrink: 0,
          background: '#ffffff', // Clean white background
          borderRadius: 16, padding: '24px 20px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.05)', position: 'sticky', top: 100,
          color: '#111827',
          border: '1px solid #e2e8f0',
          minHeight: 'calc(100vh - 140px)',
          display: 'flex', flexDirection: 'column'
        }}>

          {/* "Wallet Connect" style top box (light theme) */}
          <div style={{
            background: '#f8fafc', borderRadius: 10, padding: '14px 16px',
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
            marginBottom: 32, cursor: 'pointer',
            border: '1px solid #e2e8f0'
          }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Admin Panel</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ADMIN_LINKS.map(l => (
              <NavLink key={l.to} to={l.to} style={{ textDecoration: 'none' }}>
                {({ isActive }) => (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px', borderRadius: 12,
                      fontSize: 14.5, fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#000000' : '#64748b', // Dark text on yellow, dim gray otherwise
                      background: isActive ? '#dcf628' : 'transparent', // The neon yellow-green accent still works nicely on white!
                      transition: 'all 0.2s ease',
                      boxShadow: isActive ? '0 4px 15px rgba(220, 246, 40, 0.4)' : 'none'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <span style={{ display: 'flex', alignItems: 'center', opacity: isActive ? 1 : 0.7 }}>{l.icon}</span>
                        {l.label}
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" 
                           style={{ transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', opacity: isActive || l.subLinks.length > 0 ? 1 : 0 }}>
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>

                    {/* Submenu for active link mapping reference style layout! */}
                    {isActive && l.subLinks && l.subLinks.length > 0 && (
                      <div style={{
                        marginTop: 8, marginBottom: 8, paddingLeft: 24,
                        display: 'flex', flexDirection: 'column', gap: 12,
                        borderLeft: '1px solid #e2e8f0', marginLeft: 24
                      }}>
                        {l.subLinks.map((sub, idx) => (
                          <div key={idx} style={{
                            fontSize: 13.5, fontWeight: idx === 0 ? 700 : 500,
                            color: idx === 0 ? '#111827' : '#64748b',
                            display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer'
                          }}>
                            <span style={{ fontSize: 18, lineHeight: 0.5 }}>·</span> {sub}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </NavLink>
            ))}
          </div>

        </aside>

        {/* Page content */}
        <div style={{ flex: 1, minWidth: 0, paddingBottom: 40 }}>
          {children}
        </div>
      </div>
    </div>
  )
}
