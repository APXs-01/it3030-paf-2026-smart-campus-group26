// Member 4: Notifications, Roles & OAuth
// Branch: feature/role-based-access-control
import { useEffect, useState } from 'react'
import { getAllUsers, updateUserRole } from '../../api/users'
import { useAuth } from '../../context/AuthContext'

const ROLES = ['USER', 'TECHNICIAN', 'MANAGER', 'ADMIN']

const ROLE_META = {
  USER:       { color: '#6366f1', bg: '#eef2ff', label: 'User',       icon: '👤' },
  TECHNICIAN: { color: '#06b6d4', bg: '#e0f2fe', label: 'Technician', icon: '🔧' },
  MANAGER:    { color: '#f59e0b', bg: '#fef3c7', label: 'Manager',    icon: '📋' },
  ADMIN:      { color: '#ef4444', bg: '#fee2e2', label: 'Admin',      icon: '⚙️' },
}

function RoleBadge({ role }) {
  const m = ROLE_META[role] || ROLE_META.USER
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: m.bg, color: m.color,
      border: `1px solid ${m.color}30`,
      borderRadius: 20, padding: '3px 11px', fontSize: 11, fontWeight: 700
    }}>
      {m.icon} {m.label}
    </span>
  )
}

function Avatar({ user }) {
  if (user.picture) {
    return <img src={user.picture} alt={user.name} style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)', flexShrink: 0 }} />
  }
  const m = ROLE_META[user.role] || ROLE_META.USER
  return (
    <div style={{
      width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, ${m.color}, ${m.color}aa)`,
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 15, fontWeight: 700
    }}>
      {user.name?.[0]?.toUpperCase()}
    </div>
  )
}

export default function AdminUsersPage() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState({})
  const [pendingRole, setPendingRole] = useState({})
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')

  const load = () => {
    setLoading(true)
    getAllUsers().then(r => setUsers(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const handleRoleChange = async (userId, newRole) => {
    if (userId === me?.id) return
    setSaving(s => ({ ...s, [userId]: true }))
    try {
      const res = await updateUserRole(userId, newRole)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: res.data.role } : u))
      setPendingRole(p => { const n = { ...p }; delete n[userId]; return n })
      showToast(`Role updated to ${newRole}`, true)
    } catch {
      showToast('Failed to update role', false)
    } finally {
      setSaving(s => ({ ...s, [userId]: false }))
    }
  }

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = !filterRole || u.role === filterRole
    return matchSearch && matchRole
  })

  const roleCounts = ROLES.reduce((acc, r) => ({ ...acc, [r]: users.filter(u => u.role === r).length }), {})

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 80, right: 24, zIndex: 9999,
          padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: 13,
          background: toast.ok ? '#d1fae5' : '#fee2e2',
          color: toast.ok ? '#065f46' : '#991b1b',
          border: `1px solid ${toast.ok ? '#6ee7b7' : '#fca5a5'}`,
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeDown 0.2s ease',
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          {toast.ok ? '✓' : '✗'} {toast.msg}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1>User Management</h1>
          {!loading && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{users.length} total users</p>}
        </div>
      </div>

      {/* Role stats */}
      {!loading && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 22 }}>
          {ROLES.map(r => {
            const m = ROLE_META[r]
            return (
              <div
                key={r}
                onClick={() => setFilterRole(filterRole === r ? '' : r)}
                style={{
                  background: filterRole === r ? m.bg : '#fff',
                  border: `1.5px solid ${filterRole === r ? m.color : 'var(--border)'}`,
                  borderRadius: 10, padding: '10px 18px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10,
                  transition: 'all 0.15s',
                  boxShadow: filterRole === r ? `0 0 0 3px ${m.color}20` : 'none'
                }}
              >
                <span style={{ fontSize: 20 }}>{m.icon}</span>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: m.color, lineHeight: 1 }}>{roleCounts[r]}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: m.color, textTransform: 'uppercase', letterSpacing: '.06em' }}>{m.label}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Search + filter */}
      <div className="filters">
        <input
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: '1 1 240px', maxWidth: 340 }}
        />
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{ROLE_META[r].icon} {ROLE_META[r].label}</option>)}
        </select>
        {(search || filterRole) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setFilterRole('') }}>
            ✕ Clear
          </button>
        )}
      </div>

      {loading
        ? <div className="loading-center"><div className="spinner" /></div>
        : filtered.length === 0
          ? <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <p>No users found.</p>
              <small>Try adjusting your search or filter.</small>
            </div>
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map(u => {
                const isSelf = u.id === me?.id
                const current = pendingRole[u.id] ?? u.role
                const changed = current !== u.role
                const m = ROLE_META[u.role] || ROLE_META.USER

                return (
                  <div key={u.id} className="card" style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto auto',
                    gap: 16, alignItems: 'center', padding: '16px 20px',
                    borderLeft: `4px solid ${m.color}`,
                    opacity: isSelf ? 0.85 : 1,
                  }}>
                    {/* Avatar */}
                    <Avatar user={u} />

                    {/* Info */}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: 14 }}>{u.name}</strong>
                        {isSelf && (
                          <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 20, padding: '2px 8px' }}>
                            YOU
                          </span>
                        )}
                        <RoleBadge role={u.role} />
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.email}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 2 }}>
                        {u.provider ? `via ${u.provider}` : ''}
                        {u.createdAt ? ` · Joined ${new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}` : ''}
                      </div>
                    </div>

                    {/* Role selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <select
                        value={current}
                        disabled={isSelf || saving[u.id]}
                        onChange={e => setPendingRole(p => ({ ...p, [u.id]: e.target.value }))}
                        style={{
                          padding: '7px 30px 7px 12px', borderRadius: 8,
                          border: `1.5px solid ${changed ? ROLE_META[current]?.color || 'var(--primary)' : 'var(--border)'}`,
                          background: changed ? (ROLE_META[current]?.bg || 'var(--primary-light)') : 'var(--surface)',
                          color: changed ? (ROLE_META[current]?.color || 'var(--primary)') : 'var(--text)',
                          fontSize: 13, fontWeight: 600, cursor: isSelf ? 'not-allowed' : 'pointer',
                          appearance: 'none',
                          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
                          backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
                        }}
                      >
                        {ROLES.map(r => (
                          <option key={r} value={r}>{ROLE_META[r].icon} {ROLE_META[r].label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Save button */}
                    <div style={{ minWidth: 80 }}>
                      {isSelf ? (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Your account</span>
                      ) : changed ? (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleRoleChange(u.id, current)}
                          disabled={saving[u.id]}
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          {saving[u.id] ? '...' : '✓ Save'}
                        </button>
                      ) : (
                        saving[u.id]
                          ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                          : <span style={{ fontSize: 11, color: 'var(--text-light)' }}>No changes</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
      }
    </div>
  )
}
