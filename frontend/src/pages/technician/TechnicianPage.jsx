// Member 3: Incident Tickets & Technician Updates
// Branch: feature/technician-workflow-updates
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllTickets, updateTicket, addComment } from '../../api/tickets'
import { useAuth } from '../../context/AuthContext'

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED']
const STATUS_COLOR = {
  OPEN: '#3b82f6',
  IN_PROGRESS: '#f59e0b',
  RESOLVED: '#22c55e',
  CLOSED: '#6b7280',
  REJECTED: '#ef4444',
}
const PRIORITY_COLOR = {
  LOW: '#6b7280',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444',
  CRITICAL: '#7c3aed',
}

function Badge({ value, colorMap }) {
  const color = colorMap[value] || '#6b7280'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: color + '18', color, border: `1px solid ${color}40`,
      borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color }} />
      {value}
    </span>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '16px 12px' }}>
      <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
    </div>
  )
}

export default function TechnicianPage() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [saving, setSaving] = useState({})
  const [forms, setForms] = useState({})
  const [openComments, setOpenComments] = useState({})
  const [commentText, setCommentText] = useState({})
  const [view, setView] = useState('assigned') // 'assigned' | 'all'

  const load = () => {
    setLoading(true)
    getAllTickets().then(r => {
      setTickets(r.data)
      // initialize forms
      const f = {}
      r.data.forEach(t => {
        f[t.id] = { status: t.status, resolutionNotes: t.resolutionNotes || '', rejectionReason: t.rejectionReason || '' }
      })
      setForms(f)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const displayed = tickets
    .filter(t => view === 'assigned' ? t.assignedTo?.id === user?.id : true)
    .filter(t => filter === 'ALL' ? true : t.status === filter)
    .sort((a, b) => {
      const p = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
      return (p[a.priority] ?? 4) - (p[b.priority] ?? 4)
    })

  const assignedToMe = tickets.filter(t => t.assignedTo?.id === user?.id)
  const stats = {
    total: assignedToMe.length,
    open: assignedToMe.filter(t => t.status === 'OPEN').length,
    inProgress: assignedToMe.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: assignedToMe.filter(t => ['RESOLVED', 'CLOSED'].includes(t.status)).length,
  }

  const setForm = (id, field, val) => setForms(prev => ({ ...prev, [id]: { ...prev[id], [field]: val } }))

  const handleSave = async (id) => {
    setSaving(prev => ({ ...prev, [id]: true }))
    try {
      const f = forms[id]
      const payload = { status: f.status }
      if (f.resolutionNotes) payload.resolutionNotes = f.resolutionNotes
      if (f.rejectionReason) payload.rejectionReason = f.rejectionReason
      await updateTicket(id, payload)
      load()
    } finally {
      setSaving(prev => ({ ...prev, [id]: false }))
    }
  }

  const handlePostComment = async (ticketId) => {
    const text = commentText[ticketId]?.trim()
    if (!text) return
    await addComment(ticketId, { content: text })
    setCommentText(prev => ({ ...prev, [ticketId]: '' }))
    load()
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <h1>Technician Panel</h1>
        <Link to="/tickets/new" className="btn btn-primary">+ Report Issue</Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard label="Assigned to Me" value={stats.total} color="var(--primary)" />
        <StatCard label="Open" value={stats.open} color={STATUS_COLOR.OPEN} />
        <StatCard label="In Progress" value={stats.inProgress} color={STATUS_COLOR.IN_PROGRESS} />
        <StatCard label="Resolved" value={stats.resolved} color={STATUS_COLOR.RESOLVED} />
      </div>

      {/* View + Filter toggles */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 3 }}>
          {['assigned', 'all'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600,
              background: view === v ? 'var(--primary)' : 'transparent',
              color: view === v ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.13s',
            }}>
              {v === 'assigned' ? 'Assigned to Me' : 'All Tickets'}
            </button>
          ))}
        </div>

        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{
            padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)',
            fontSize: 13, background: 'var(--surface)', color: 'var(--text)',
          }}
        >
          <option value="ALL">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {displayed.length} ticket{displayed.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Ticket list */}
      {displayed.length === 0 ? (
        <div className="empty-state">
          <p>{view === 'assigned' ? 'No tickets assigned to you.' : 'No tickets found.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {displayed.map(t => {
            const form = forms[t.id] || { status: t.status, resolutionNotes: '', rejectionReason: '' }
            const dirty = form.status !== t.status || form.resolutionNotes !== (t.resolutionNotes || '') || form.rejectionReason !== (t.rejectionReason || '')
            const commentOpen = openComments[t.id]
            const isAssignedToMe = t.assignedTo?.id === user?.id

            return (
              <div key={t.id} className="card" style={{
                borderLeft: `4px solid ${STATUS_COLOR[t.status] || '#6b7280'}`,
                padding: 0, overflow: 'hidden',
              }}>
                {/* Card header */}
                <div style={{ padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 13 }}>#{t.id}</span>
                      <Badge value={t.status} colorMap={STATUS_COLOR} />
                      <Badge value={t.priority} colorMap={PRIORITY_COLOR} />
                      {isAssignedToMe && (
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 10,
                          background: 'var(--primary-light)', color: 'var(--primary)',
                        }}>Mine</span>
                      )}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{t.category} — {t.location}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                      Reported by <strong>{t.reportedBy?.name}</strong>
                      {t.assignedTo && <> · Assigned to <strong>{t.assignedTo.name}</strong></>}
                    </div>
                    <p style={{
                      fontSize: 13, color: 'var(--text-secondary, #555)', margin: 0,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>{t.description}</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(t.createdAt).toLocaleDateString()}</span>
                    <Link to={`/tickets/${t.id}`} className="btn btn-secondary btn-sm">View</Link>
                  </div>
                </div>

                {/* Update controls */}
                <div style={{ padding: '10px 18px', background: 'var(--surface-2, #f8fafc)', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: '0 0 auto' }}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>STATUS</label>
                      <select
                        value={form.status}
                        onChange={e => setForm(t.id, 'status', e.target.value)}
                        style={{
                          padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border)',
                          fontSize: 12, background: 'var(--surface)', color: STATUS_COLOR[form.status] || 'var(--text)',
                          fontWeight: 600,
                        }}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    {(form.status === 'RESOLVED') && (
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>RESOLUTION NOTES</label>
                        <input
                          className="form-control"
                          style={{ padding: '5px 10px', fontSize: 12 }}
                          placeholder="Describe how it was resolved..."
                          value={form.resolutionNotes}
                          onChange={e => setForm(t.id, 'resolutionNotes', e.target.value)}
                        />
                      </div>
                    )}

                    {(form.status === 'REJECTED') && (
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>REJECTION REASON</label>
                        <input
                          className="form-control"
                          style={{ padding: '5px 10px', fontSize: 12 }}
                          placeholder="Why is this being rejected?"
                          value={form.rejectionReason}
                          onChange={e => setForm(t.id, 'rejectionReason', e.target.value)}
                        />
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 'auto' }}>
                      <button
                        onClick={() => setOpenComments(prev => ({ ...prev, [t.id]: !commentOpen }))}
                        style={{
                          background: 'none', border: '1px solid var(--border)', borderRadius: 6,
                          padding: '5px 12px', fontSize: 12, cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 600,
                        }}
                      >
                        💬 {t.comments?.length || 0}
                      </button>

                      {dirty && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleSave(t.id)}
                          disabled={saving[t.id]}
                        >
                          {saving[t.id] ? 'Saving…' : 'Save'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Inline comments */}
                {commentOpen && (
                  <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)' }}>
                    {t.comments?.length === 0 && (
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>No comments yet.</p>
                    )}
                    {t.comments?.map(c => (
                      <div key={c.id} style={{
                        display: 'flex', gap: 8, marginBottom: 8,
                        padding: '8px 10px', background: 'var(--surface)', borderRadius: 8,
                        border: '1px solid var(--border)',
                      }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)',
                          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 700, flexShrink: 0,
                        }}>
                          {c.author?.name?.[0]?.toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 2 }}>
                            {c.author?.name}
                            {c.author?.id === user?.id && (
                              <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--primary)', background: 'var(--primary-light)', padding: '1px 6px', borderRadius: 8 }}>You</span>
                            )}
                          </div>
                          <p style={{ fontSize: 12, margin: 0, lineHeight: 1.5 }}>{c.content}</p>
                        </div>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>
                          {new Date(c.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <input
                        className="form-control"
                        style={{ fontSize: 12, padding: '6px 10px' }}
                        placeholder="Add a comment..."
                        value={commentText[t.id] || ''}
                        onChange={e => setCommentText(prev => ({ ...prev, [t.id]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handlePostComment(t.id)}
                      />
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handlePostComment(t.id)}
                        disabled={!commentText[t.id]?.trim()}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
