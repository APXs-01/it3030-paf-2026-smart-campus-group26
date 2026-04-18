// Member 4: Notifications, Roles & OAuth
// Branch: feature/notification-service-alerts
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getPreferences, updatePreferences } from '../api/notifications'
import { deleteMyAccount } from '../api/users'

const CATEGORIES = [
  {
    key: 'BOOKING_APPROVED',
    label: 'Booking Approved',
    desc: 'When your booking request is approved by an admin.',
    icon: '✅',
    group: 'Bookings',
  },
  {
    key: 'BOOKING_REJECTED',
    label: 'Booking Rejected',
    desc: 'When your booking request is declined.',
    icon: '❌',
    group: 'Bookings',
  },
  {
    key: 'BOOKING_CANCELLED',
    label: 'Booking Cancelled',
    desc: 'When a booking you made is cancelled.',
    icon: '🚫',
    group: 'Bookings',
  },
  {
    key: 'TICKET_STATUS_CHANGED',
    label: 'Ticket Status Changed',
    desc: 'When the status of your ticket is updated.',
    icon: '🔄',
    group: 'Tickets',
  },
  {
    key: 'TICKET_ASSIGNED',
    label: 'Ticket Assigned',
    desc: 'When a technician is assigned to your ticket.',
    icon: '👤',
    group: 'Tickets',
  },
  {
    key: 'TICKET_COMMENT_ADDED',
    label: 'New Comment on Ticket',
    desc: 'When someone comments on your ticket.',
    icon: '💬',
    group: 'Tickets',
  },
  {
    key: 'GENERAL',
    label: 'General Announcements',
    desc: 'System-wide announcements and campus notices.',
    icon: '📢',
    group: 'General',
  },
]

const GROUPS = [...new Set(CATEGORIES.map(c => c.group))]

function Toggle({ enabled, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        background: enabled ? 'var(--primary)' : 'var(--border)',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
      }}
      aria-checked={enabled}
      role="switch"
    >
      <span style={{
        position: 'absolute', top: 3, left: enabled ? 23 : 3,
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
      }} />
    </button>
  )
}

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [disabled, setDisabled] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    getPreferences()
      .then(r => setDisabled(new Set(r.data.disabled || [])))
      .finally(() => setLoading(false))
  }, [])

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const toggle = (key) => {
    setDisabled(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
    setDirty(true)
  }

  const toggleGroup = (group) => {
    const keys = CATEGORIES.filter(c => c.group === group).map(c => c.key)
    const allEnabled = keys.every(k => !disabled.has(k))
    setDisabled(prev => {
      const next = new Set(prev)
      if (allEnabled) keys.forEach(k => next.add(k))
      else keys.forEach(k => next.delete(k))
      return next
    })
    setDirty(true)
  }

  const enableAll = () => {
    setDisabled(new Set())
    setDirty(true)
  }

  const disableAll = () => {
    setDisabled(new Set(CATEGORIES.map(c => c.key)))
    setDirty(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updatePreferences([...disabled])
      setDirty(false)
      showToast('Preferences saved successfully', true)
    } catch {
      showToast('Failed to save preferences', false)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      await deleteMyAccount()
      logout()
      navigate('/login')
    } catch {
      showToast('Failed to delete account. Please try again.', false)
      setDeleting(false)
    }
  }

  const enabledCount = CATEGORIES.length - disabled.size

  return (
    <div style={{ maxWidth: 680 }}>
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
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {toast.ok ? '✓' : '✗'} {toast.msg}
        </div>
      )}

      <div className="page-header">
        <h1>Settings</h1>
      </div>

      {/* Profile card */}
      <div className="card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
        {user?.picture
          ? <img src={user.picture} alt="" style={{ width: 56, height: 56, borderRadius: '50%', border: '3px solid var(--border)' }} />
          : <div style={{
              width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg,var(--primary),var(--primary-dark))',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 800,
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
        }
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{user?.name}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{user?.email}</div>
          <div style={{ marginTop: 6 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'var(--primary-light)', color: 'var(--primary)',
              borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '.06em',
            }}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Notification preferences card */}
      <div className="card">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔔</span>
              Notification Preferences
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Choose which notifications you want to receive. &nbsp;
              <strong style={{ color: 'var(--primary)' }}>{enabledCount} of {CATEGORIES.length}</strong> enabled.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={enableAll}>Enable All</button>
            <button className="btn btn-ghost btn-sm" onClick={disableAll}>Disable All</button>
          </div>
        </div>

        {loading
          ? <div className="loading-center" style={{ padding: 40 }}><div className="spinner" /></div>
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {GROUPS.map(group => {
                const cats = CATEGORIES.filter(c => c.group === group)
                const allOn = cats.every(c => !disabled.has(c.key))
                const someOn = cats.some(c => !disabled.has(c.key))

                return (
                  <div key={group}>
                    {/* Group header */}
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid var(--border)',
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.07em' }}>
                        {group}
                      </span>
                      <button
                        onClick={() => toggleGroup(group)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontSize: 12, fontWeight: 600,
                          color: allOn ? 'var(--danger)' : 'var(--primary)',
                          padding: '2px 6px',
                        }}
                      >
                        {allOn ? 'Disable all' : someOn ? 'Enable all' : 'Enable all'}
                      </button>
                    </div>

                    {/* Category rows */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {cats.map(cat => {
                        const enabled = !disabled.has(cat.key)
                        return (
                          <div
                            key={cat.key}
                            onClick={() => toggle(cat.key)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 14,
                              padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                              background: enabled ? 'var(--surface)' : 'var(--surface-2)',
                              border: `1.5px solid ${enabled ? 'var(--border)' : 'var(--border)'}`,
                              transition: 'all 0.15s',
                              opacity: enabled ? 1 : 0.65,
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
                            onMouseLeave={e => e.currentTarget.style.background = enabled ? 'var(--surface)' : 'var(--surface-2)'}
                          >
                            <span style={{
                              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                              background: enabled ? 'var(--primary-light)' : 'var(--border)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 18, transition: 'background 0.15s',
                            }}>
                              {cat.icon}
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 600, fontSize: 13.5, color: enabled ? 'var(--text)' : 'var(--text-muted)' }}>
                                {cat.label}
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
                                {cat.desc}
                              </div>
                            </div>
                            <Toggle enabled={enabled} onChange={() => toggle(cat.key)} />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        }

        {/* Save button */}
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          {dirty && (
            <span style={{ fontSize: 13, color: 'var(--warning)', fontWeight: 600, alignSelf: 'center' }}>
              ● Unsaved changes
            </span>
          )}
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || !dirty}
          >
            {saving ? 'Saving…' : '✓ Save Preferences'}
          </button>
        </div>
      </div>

      {/* Account Settings card */}
      <div className="card" style={{ marginTop: 20, border: '1.5px solid #fee2e2' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 30, height: 30, borderRadius: 8, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</span>
          Account Settings
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
          Manage your account. Destructive actions cannot be undone.
        </p>

        {!deleteConfirm ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 10, border: '1.5px solid #fee2e2', background: '#fff5f5' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--danger)' }}>Delete Account</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Permanently removes your account, bookings, and notifications.
              </div>
            </div>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => setDeleteConfirm(true)}
              style={{ flexShrink: 0, marginLeft: 16 }}
            >
              Delete Account
            </button>
          </div>
        ) : (
          <div style={{ padding: '16px', borderRadius: 10, border: '1.5px solid var(--danger)', background: '#fff5f5' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--danger)', marginBottom: 12 }}>
              ⚠️ This will permanently delete your account. Type <strong>DELETE</strong> to confirm.
            </p>
            <input
              className="form-input"
              placeholder='Type DELETE to confirm'
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              style={{ marginBottom: 12, borderColor: 'var(--danger)' }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-danger"
                onClick={handleDeleteAccount}
                disabled={deleteInput !== 'DELETE' || deleting}
                style={{ flex: 1 }}
              >
                {deleting ? 'Deleting…' : 'Permanently Delete Account'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => { setDeleteConfirm(false); setDeleteInput('') }}
                disabled={deleting}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
