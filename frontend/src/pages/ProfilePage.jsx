import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { updateMyProfile, uploadAvatar } from '../api/users'
import { getMyBookings } from '../api/bookings'
import { getMyTickets } from '../api/tickets'

const ROLE_COLOR = {
  ADMIN:      { bg: '#eff6ff', color: '#2563eb' },
  TECHNICIAN: { bg: '#f0fdf4', color: '#16a34a' },
  MANAGER:    { bg: '#fefce8', color: '#ca8a04' },
  USER:       { bg: '#f8fafc', color: '#64748b' },
}

export default function ProfilePage() {
  const { user, login } = useAuth()
  const fileInputRef = useRef(null)

  const [stats, setStats]         = useState(null)
  const [toast, setToast]         = useState(null)
  const [editOpen, setEditOpen]   = useState(false)
  const [saving, setSaving]       = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)

  // Edit form state
  const [form, setForm] = useState({ name: '', phone: '', address: '', bio: '' })

  useEffect(() => {
    if (user) {
      setForm({
        name:    user.name    || '',
        phone:   user.phone   || '',
        address: user.address || '',
        bio:     user.bio     || '',
      })
    }
  }, [user])

  useEffect(() => {
    Promise.allSettled([getMyBookings(), getMyTickets()]).then(([b, t]) => {
      const bookings = b.value?.data || []
      const tickets  = t.value?.data || []
      setStats({
        totalBookings:    bookings.length,
        approvedBookings: bookings.filter(x => x.status === 'APPROVED').length,
        pendingBookings:  bookings.filter(x => x.status === 'PENDING').length,
        totalTickets:     tickets.length,
        openTickets:      tickets.filter(x => x.status === 'OPEN').length,
        resolvedTickets:  tickets.filter(x => x.status === 'RESOLVED').length,
      })
    })
  }, [])

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const refreshUser = async () => {
    const token = localStorage.getItem('token')
    if (token) await login(token)
  }

  /* ── Avatar upload ── */
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { showToast('Only image files allowed', false); return }
    if (file.size > 5 * 1024 * 1024)    { showToast('Image must be under 5 MB', false); return }

    const fd = new FormData()
    fd.append('file', file)
    setAvatarLoading(true)
    try {
      await uploadAvatar(fd)
      await refreshUser()
      showToast('Profile picture updated')
    } catch {
      showToast('Failed to upload picture', false)
    } finally {
      setAvatarLoading(false)
      e.target.value = ''
    }
  }

  /* ── Profile fields save ── */
  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      await updateMyProfile({
        name:    form.name.trim(),
        phone:   form.phone.trim(),
        address: form.address.trim(),
        bio:     form.bio.trim(),
      })
      await refreshUser()
      setEditOpen(false)
      showToast('Profile updated successfully')
    } catch {
      showToast('Failed to update profile', false)
    } finally {
      setSaving(false)
    }
  }

  const openEdit = () => {
    setForm({
      name:    user?.name    || '',
      phone:   user?.phone   || '',
      address: user?.address || '',
      bio:     user?.bio     || '',
    })
    setEditOpen(true)
  }

  const roleStyle = ROLE_COLOR[user?.role] || ROLE_COLOR.USER
  const PROVIDER_LABEL = { google: 'Google', local: 'Email & Password' }

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
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        }}>
          {toast.ok ? '✓' : '✗'} {toast.msg}
        </div>
      )}

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Profile</h1>
        <button className="btn btn-primary btn-sm" onClick={openEdit}>✏️ Edit Profile</button>
      </div>

      {/* ── Avatar + Identity card ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>

          {/* Clickable avatar */}
          <div style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }}
               onClick={() => fileInputRef.current?.click()}
               title="Click to change photo">
            {user?.picture
              ? <img src={user.picture} alt="" referrerPolicy="no-referrer"
                  style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid var(--border)',
                           opacity: avatarLoading ? 0.5 : 1, transition: 'opacity 0.2s' }} />
              : <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 30, fontWeight: 800,
                    opacity: avatarLoading ? 0.5 : 1,
                  }}>
                  {user?.name?.[0]?.toUpperCase()}
                </div>
            }
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 26, height: 26, borderRadius: '50%',
              background: 'var(--primary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, border: '2px solid #fff',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            }}>
              {avatarLoading ? <div className="spinner" style={{ width: 10, height: 10, borderWidth: 2 }} /> : '📷'}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*"
                   style={{ display: 'none' }} onChange={handleAvatarChange} />
          </div>

          {/* Identity */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{user?.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>{user?.email}</div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                background: roleStyle.bg, color: roleStyle.color,
                borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '.06em',
              }}>{user?.role}</span>
              {user?.provider && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: 'var(--surface-2)', color: 'var(--text-muted)',
                  borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 600,
                }}>
                  {user.provider === 'google' ? '🔵' : '🔑'} {PROVIDER_LABEL[user.provider] || user.provider}
                </span>
              )}
            </div>

            {/* Extra fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {user?.phone && (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>📞</span> {user.phone}
                </div>
              )}
              {user?.address && (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>📍</span> {user.address}
                </div>
              )}
              {user?.bio && (
                <div style={{ fontSize: 13, color: 'var(--text)', marginTop: 4, fontStyle: 'italic', maxWidth: 380 }}>
                  "{user.bio}"
                </div>
              )}
            </div>

            {user?.createdAt && (
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                Member since {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Activity stats ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📊</span>
          Activity Overview
        </h2>
        {!stats
          ? <div className="loading-center" style={{ padding: 32 }}><div className="spinner" /></div>
          : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { label: 'Total Bookings', value: stats.totalBookings,   icon: '📅', color: '#2563eb', sub: `${stats.approvedBookings} approved` },
                { label: 'Pending',        value: stats.pendingBookings, icon: '⏳', color: '#f59e0b', sub: 'awaiting review' },
                { label: 'Total Tickets',  value: stats.totalTickets,   icon: '🎫', color: '#7c3aed', sub: `${stats.resolvedTickets} resolved` },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--surface-2)', borderRadius: 12, padding: 16, border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginTop: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.sub}</div>
                </div>
              ))}
            </div>
          )
        }
      </div>

      {/* ── Quick links ── */}
      <div className="card">
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🔗</span>
          Quick Links
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            { to: '/bookings/my',  icon: '📅', label: 'My Bookings',  desc: 'View all your resource bookings' },
            { to: '/tickets/my',   icon: '🎫', label: 'My Tickets',   desc: 'Track your submitted tickets' },
            { to: '/bookings/new', icon: '➕', label: 'New Booking',  desc: 'Reserve a campus resource' },
            { to: '/settings',     icon: '⚙️', label: 'Settings',     desc: 'Notification preferences & account' },
          ].map(l => (
            <Link key={l.to} to={l.to} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 14px', borderRadius: 10, textDecoration: 'none',
              color: 'var(--text)', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>{l.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{l.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l.desc}</div>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: 16 }}>›</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Edit modal ── */}
      {editOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }} onClick={() => !saving && setEditOpen(false)}>
          <div style={{
            background: 'var(--surface)', borderRadius: 16, padding: 28,
            width: '100%', maxWidth: 480, boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
            border: '1px solid var(--border)',
          }} onClick={e => e.stopPropagation()}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Edit Profile</h2>
              <button onClick={() => setEditOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-muted)', lineHeight: 1 }}>
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Name */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                  Full Name <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input className="form-control" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Your full name" />
              </div>

              {/* Phone */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                  Phone Number
                </label>
                <input className="form-control" value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+94 77 000 0000" type="tel" />
              </div>

              {/* Address */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                  Address
                </label>
                <input className="form-control" value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="City, Country" />
              </div>

              {/* Bio */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                  Bio
                </label>
                <textarea className="form-control" value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="A short description about yourself…"
                  rows={3} style={{ resize: 'vertical' }} maxLength={500} />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', marginTop: 4 }}>
                  {form.bio.length}/500
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setEditOpen(false)} disabled={saving}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave}
                disabled={saving || !form.name.trim()}>
                {saving ? 'Saving…' : '✓ Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
