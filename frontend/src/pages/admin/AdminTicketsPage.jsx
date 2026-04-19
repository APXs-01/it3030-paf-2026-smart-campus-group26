// Member 3: Incident Tickets & Technician Updates
// Branch: feature/technician-workflow-updates
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllTickets, updateTicket, deleteTicket, addComment, deleteComment } from '../../api/tickets'
import { getAllUsers } from '../../api/users'
import { useAuth } from '../../context/AuthContext'

const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED']
const FILTER_STATUSES = ['', ...STATUSES]

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
      borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color }} />
      {value}
    </span>
  )
}

// Inline comment section for a single ticket in the admin view
function TicketComments({ ticket, currentUser, onRefresh }) {
  const [open, setOpen] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting] = useState(false)
  const comments = ticket.comments || []

  const handlePost = async () => {
    if (!newComment.trim()) return
    setPosting(true)
    try {
      await addComment(ticket.id, { content: newComment })
      setNewComment('')
      onRefresh()
    } finally {
      setPosting(false)
    }
  }

  const handleDelete = async (commentId) => {
    if (confirm('Delete this comment?')) {
      await deleteComment(commentId)
      onRefresh()
    }
  }

  return (
    <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, color: 'var(--primary)',
          display: 'flex', alignItems: 'center', gap: 6, padding: 0, marginBottom: open ? 12 : 0
        }}
      >
        <span style={{ fontSize: 16 }}>{open ? '▾' : '▸'}</span>
        Comments {comments.length > 0 && (
          <span style={{
            background: 'var(--primary)', color: '#fff',
            borderRadius: 20, padding: '1px 7px', fontSize: 11
          }}>{comments.length}</span>
        )}
      </button>

      {open && (
        <div>
          {/* Existing comments */}
          {comments.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>No comments yet.</p>
          )}
          {comments.map(c => (
            <div key={c.id} style={{
              padding: '10px 12px', marginBottom: 8, borderRadius: 8,
              background: c.author?.id === currentUser?.id ? '#eff6ff' : '#f9fafb',
              border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, flexShrink: 0
                  }}>
                    {c.author?.name?.[0]?.toUpperCase()}
                  </div>
                  <strong style={{ fontSize: 12 }}>{c.author?.name}</strong>
                  {c.author?.id === currentUser?.id && (
                    <span style={{ fontSize: 10, color: 'var(--primary)', background: '#dbeafe', padding: '1px 6px', borderRadius: 10 }}>You</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <small style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                    {new Date(c.createdAt).toLocaleString()}
                  </small>
                  {c.author?.id === currentUser?.id && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#ef4444', fontSize: 12, padding: '0 2px'
                      }}
                      title="Delete comment"
                    >✕</button>
                  )}
                </div>
              </div>
              <p style={{ fontSize: 13, margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{c.content}</p>
            </div>
          ))}

          {/* Add comment */}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input
              className="form-control"
              style={{ fontSize: 13, flex: 1 }}
              placeholder="Add a comment..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePost() } }}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={handlePost}
              disabled={posting || !newComment.trim()}
              style={{ whiteSpace: 'nowrap' }}
            >
              {posting ? '...' : 'Post'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminTicketsPage() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [updates, setUpdates] = useState({})
  const [saving, setSaving] = useState({})

  const load = () => {
    setLoading(true)
    getAllTickets(filter ? { status: filter } : {})
      .then(r => setTickets(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter])
  useEffect(() => { getAllUsers().then(r => setUsers(r.data)) }, [])

  const setUpdate = (id, field, value) =>
    setUpdates(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }))

  const getUpdate = (id, field, fallback = '') =>
    updates[id]?.[field] !== undefined ? updates[id][field] : fallback

  const handleApply = async (ticket) => {
    setSaving(prev => ({ ...prev, [ticket.id]: true }))
    try {
      const u = updates[ticket.id] || {}
      const payload = { status: u.status || ticket.status }
      if (u.assignedToUserId !== undefined) payload.assignedToUserId = u.assignedToUserId ? Number(u.assignedToUserId) : null
      if (u.resolutionNotes !== undefined) payload.resolutionNotes = u.resolutionNotes
      if (u.rejectionReason !== undefined) payload.rejectionReason = u.rejectionReason
      await updateTicket(ticket.id, payload)
      setUpdates(prev => { const n = { ...prev }; delete n[ticket.id]; return n })
      load()
    } finally {
      setSaving(prev => ({ ...prev, [ticket.id]: false }))
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Permanently delete this ticket?')) {
      await deleteTicket(id)
      load()
    }
  }

  const stats = STATUSES.map(s => ({ label: s, count: tickets.filter(t => t.status === s).length, color: STATUS_COLOR[s] }))

  return (
    <div>
      <div className="page-header">
        <h1>Manage Tickets</h1>
        <Link to="/tickets/my" className="btn btn-secondary">My Tickets</Link>
      </div>

      {/* Stats row */}
      {!loading && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {stats.map(s => (
            <div key={s.label} style={{
              background: s.color + '12', border: `1px solid ${s.color}30`,
              borderRadius: 10, padding: '8px 16px', textAlign: 'center', minWidth: 90,
              cursor: 'pointer', outline: filter === s.label ? `2px solid ${s.color}` : 'none'
            }} onClick={() => setFilter(filter === s.label ? '' : s.label)}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.count}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: s.color, letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="filters" style={{ marginBottom: 16 }}>
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          {FILTER_STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
      </div>

      {loading
        ? <div className="loading-center"><div className="spinner" /></div>
        : tickets.length === 0
          ? <div className="empty-state"><p>No tickets found.</p></div>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tickets.map(t => {
                const pendingStatus = getUpdate(t.id, 'status', t.status)
                const isSaving = saving[t.id]
                return (
                  <div key={t.id} className="card" style={{ borderLeft: `4px solid ${STATUS_COLOR[t.status] || '#6b7280'}` }}>
                    {/* Top section */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 12, alignItems: 'start', marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Ticket</div>
                        <Link to={`/tickets/${t.id}`} style={{ fontWeight: 700, fontSize: 15, color: 'var(--primary)', textDecoration: 'none' }}>
                          #{t.id} — {t.category}
                        </Link>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>📍 {t.location}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Reporter</div>
                        <div style={{ fontSize: 13 }}>{t.reportedBy?.name}</div>
                        {t.contactDetails && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.contactDetails}</div>}
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Priority</div>
                        <Badge value={t.priority} colorMap={PRIORITY_COLOR} />
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Status</div>
                        <Badge value={t.status} colorMap={STATUS_COLOR} />
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{new Date(t.createdAt).toLocaleDateString()}</div>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>Delete</button>
                      </div>
                    </div>

                    {/* Description */}
                    <p style={{ fontSize: 13, color: 'var(--text-secondary, #555)', marginBottom: 14, lineHeight: 1.5 }}>
                      {t.description}
                    </p>

                    {t.assignedTo && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                        👤 Currently assigned to: <strong>{t.assignedTo.name}</strong>
                      </div>
                    )}

                    {t.resolutionNotes && (
                      <div style={{ padding: '8px 12px', background: '#d1fae5', borderRadius: 6, borderLeft: '3px solid #22c55e', marginBottom: 10, fontSize: 13 }}>
                        <strong>Resolution:</strong> {t.resolutionNotes}
                      </div>
                    )}
                    {t.rejectionReason && (
                      <div style={{ padding: '8px 12px', background: '#fee2e2', borderRadius: 6, borderLeft: '3px solid #ef4444', marginBottom: 10, fontSize: 13 }}>
                        <strong>Rejection Reason:</strong> {t.rejectionReason}
                      </div>
                    )}

                    {/* Update controls */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: 11 }}>Update Status</label>
                        <select
                          className="form-control"
                          style={{ fontSize: 13 }}
                          value={getUpdate(t.id, 'status', t.status)}
                          onChange={e => setUpdate(t.id, 'status', e.target.value)}
                        >
                          {STATUSES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: 11 }}>Assign Technician</label>
                        <select
                          className="form-control"
                          style={{ fontSize: 13 }}
                          value={getUpdate(t.id, 'assignedToUserId', t.assignedTo?.id?.toString() || '')}
                          onChange={e => setUpdate(t.id, 'assignedToUserId', e.target.value)}
                        >
                          <option value="">Unassigned</option>
                          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button
                          className="btn btn-primary"
                          style={{ width: '100%', fontSize: 13 }}
                          onClick={() => handleApply(t)}
                          disabled={isSaving}
                        >
                          {isSaving ? 'Saving...' : 'Apply Changes'}
                        </button>
                      </div>
                    </div>

                    {(pendingStatus === 'RESOLVED' || t.resolutionNotes) && (
                      <div className="form-group" style={{ marginTop: 10, marginBottom: 0 }}>
                        <label style={{ fontSize: 11 }}>Resolution Notes</label>
                        <textarea
                          className="form-control" rows={2} style={{ fontSize: 13 }}
                          placeholder="Describe how the issue was resolved..."
                          value={getUpdate(t.id, 'resolutionNotes', t.resolutionNotes || '')}
                          onChange={e => setUpdate(t.id, 'resolutionNotes', e.target.value)}
                        />
                      </div>
                    )}

                    {(pendingStatus === 'REJECTED' || t.rejectionReason) && (
                      <div className="form-group" style={{ marginTop: 10, marginBottom: 0 }}>
                        <label style={{ fontSize: 11 }}>Rejection Reason</label>
                        <textarea
                          className="form-control" rows={2} style={{ fontSize: 13 }}
                          placeholder="Explain why this ticket is being rejected..."
                          value={getUpdate(t.id, 'rejectionReason', t.rejectionReason || '')}
                          onChange={e => setUpdate(t.id, 'rejectionReason', e.target.value)}
                        />
                      </div>
                    )}

                    {t.attachmentUrls?.length > 0 && (
                      <div style={{ marginTop: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
                        {t.attachmentUrls.map((url, i) => (
                          <a key={i} href={`http://localhost:8081${url}`} target="_blank" rel="noopener noreferrer">
                            <img src={`http://localhost:8081${url}`} alt={`attach ${i + 1}`}
                              style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
                          </a>
                        ))}
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>
                          {t.attachmentUrls.length} attachment{t.attachmentUrls.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}

                    {/* Inline Comments */}
                    <TicketComments ticket={t} currentUser={user} onRefresh={load} />
                  </div>
                )
              })}
            </div>
      }
    </div>
  )
}
