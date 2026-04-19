// Member 3: Incident Tickets & Technician Updates
// Branch: feature/technician-workflow-updates
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTicket, addComment, updateComment, deleteComment, updateTicket, deleteTicket } from '../../api/tickets'
import { getAllUsers } from '../../api/users'
import { useAuth } from '../../context/AuthContext'

const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED']

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
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: color + '18', color, border: `1px solid ${color}40`,
      borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 700
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
      {value}
    </span>
  )
}

function InfoCell({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 14 }}>{value || <span style={{ color: 'var(--text-muted)' }}>—</span>}</div>
    </div>
  )
}

export default function TicketDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isTechnician, isAdmin } = useAuth()
  const [ticket, setTicket] = useState(null)
  const [users, setUsers] = useState([])
  const [newComment, setNewComment] = useState('')
  const [editingComment, setEditingComment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [adminForm, setAdminForm] = useState({
    status: '', assignedToUserId: '', resolutionNotes: '', rejectionReason: ''
  })

  const load = () => {
    setLoading(true)
    getTicket(id).then(r => {
      setTicket(r.data)
      setAdminForm(prev => ({
        ...prev,
        status: r.data.status || '',
        assignedToUserId: r.data.assignedTo?.id?.toString() || '',
        resolutionNotes: r.data.resolutionNotes || '',
        rejectionReason: r.data.rejectionReason || '',
      }))
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])
  useEffect(() => {
    if (isTechnician()) getAllUsers().then(r => setUsers(r.data))
  }, [])

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    await addComment(id, { content: newComment })
    setNewComment('')
    load()
  }

  const handleUpdateComment = async (commentId) => {
    await updateComment(commentId, { content: editingComment.content })
    setEditingComment(null)
    load()
  }

  const handleDeleteComment = async (commentId) => {
    if (confirm('Delete comment?')) { await deleteComment(commentId); load() }
  }

  const handleAdminUpdate = async () => {
    setSaving(true)
    try {
      const payload = { status: adminForm.status }
      if (adminForm.assignedToUserId) payload.assignedToUserId = Number(adminForm.assignedToUserId)
      if (adminForm.resolutionNotes) payload.resolutionNotes = adminForm.resolutionNotes
      if (adminForm.rejectionReason) payload.rejectionReason = adminForm.rejectionReason
      await updateTicket(id, payload)
      load()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (confirm('Permanently delete this ticket?')) {
      await deleteTicket(id)
      navigate('/admin/tickets')
    }
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>
  if (!ticket) return <div className="empty-state"><p>Ticket not found.</p></div>

  const pendingStatus = adminForm.status || ticket.status

  return (
    <div style={{ maxWidth: 820 }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <button className="btn btn-secondary btn-sm" style={{ marginBottom: 8 }} onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1 style={{ margin: 0 }}>Ticket #{ticket.id}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Badge value={ticket.status} colorMap={STATUS_COLOR} />
          <Badge value={ticket.priority} colorMap={PRIORITY_COLOR} />
          {isAdmin() && (
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
          )}
        </div>
      </div>

      {/* Ticket info card */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <InfoCell label="Category" value={ticket.category} />
          <InfoCell label="Location" value={ticket.location} />
          <InfoCell label="Reported By" value={ticket.reportedBy?.name} />
          <InfoCell label="Assigned To" value={ticket.assignedTo?.name} />
          {ticket.contactDetails && <InfoCell label="Contact" value={ticket.contactDetails} />}
          <InfoCell label="Created" value={new Date(ticket.createdAt).toLocaleString()} />
          {ticket.resource && <InfoCell label="Related Resource" value={ticket.resource.name} />}
          {ticket.updatedAt && <InfoCell label="Last Updated" value={new Date(ticket.updatedAt).toLocaleString()} />}
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>
            Description
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{ticket.description}</p>
        </div>

        {/* Resolution / Rejection banners */}
        {ticket.resolutionNotes && (
          <div style={{ padding: '12px 16px', background: '#d1fae5', borderRadius: 8, borderLeft: '4px solid #22c55e', marginTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#166534', marginBottom: 4 }}>RESOLUTION NOTES</div>
            <p style={{ margin: 0, fontSize: 14, color: '#166534' }}>{ticket.resolutionNotes}</p>
          </div>
        )}
        {ticket.rejectionReason && (
          <div style={{ padding: '12px 16px', background: '#fee2e2', borderRadius: 8, borderLeft: '4px solid #ef4444', marginTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#991b1b', marginBottom: 4 }}>REJECTION REASON</div>
            <p style={{ margin: 0, fontSize: 14, color: '#991b1b' }}>{ticket.rejectionReason}</p>
          </div>
        )}

        {/* Attachments */}
        {ticket.attachmentUrls?.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>
              Attachments ({ticket.attachmentUrls.length})
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {ticket.attachmentUrls.map((url, i) => (
                <a key={i} href={`http://localhost:8081${url}`} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'block', borderRadius: 8, overflow: 'hidden', border: '2px solid var(--border)', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <img
                    src={`http://localhost:8081${url}`}
                    alt={`Attachment ${i + 1}`}
                    style={{ width: 100, height: 100, objectFit: 'cover', display: 'block' }}
                  />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Admin / Technician update panel */}
      {isTechnician() && (
        <div className="card" style={{ marginBottom: 16, borderLeft: '4px solid var(--primary)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--primary)' }}>
            ⚙ Manage Ticket
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Update Status</label>
              <select className="form-control" value={adminForm.status}
                onChange={e => setAdminForm(f => ({ ...f, status: e.target.value }))}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Assign Technician</label>
              <select className="form-control"
                value={adminForm.assignedToUserId}
                onChange={e => setAdminForm(f => ({ ...f, assignedToUserId: e.target.value }))}>
                <option value="">Unassigned</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>

          {(pendingStatus === 'RESOLVED' || ticket.resolutionNotes) && (
            <div className="form-group" style={{ marginTop: 12 }}>
              <label>Resolution Notes <span style={{ color: '#ef4444' }}>*</span></label>
              <textarea className="form-control" rows={3}
                placeholder="Describe how the issue was resolved..."
                value={adminForm.resolutionNotes}
                onChange={e => setAdminForm(f => ({ ...f, resolutionNotes: e.target.value }))} />
            </div>
          )}

          {(pendingStatus === 'REJECTED' || ticket.rejectionReason) && (
            <div className="form-group" style={{ marginTop: 12 }}>
              <label>Rejection Reason <span style={{ color: '#ef4444' }}>*</span></label>
              <textarea className="form-control" rows={3}
                placeholder="Explain why this ticket is being rejected..."
                value={adminForm.rejectionReason}
                onChange={e => setAdminForm(f => ({ ...f, rejectionReason: e.target.value }))} />
            </div>
          )}

          <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={handleAdminUpdate} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* Comments */}
      <div className="card">
        <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 700 }}>
          Comments {ticket.comments?.length > 0 && `(${ticket.comments.length})`}
        </h3>

        {!ticket.comments?.length && (
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>No comments yet. Be the first to comment.</p>
        )}

        {ticket.comments?.map(c => (
          <div key={c.id} style={{
            padding: '12px 14px', marginBottom: 10, borderRadius: 8,
            background: c.author?.id === user?.id ? '#eff6ff' : '#f9fafb',
            border: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, flexShrink: 0
                }}>
                  {c.author?.name?.[0]?.toUpperCase()}
                </div>
                <strong style={{ fontSize: 13 }}>{c.author?.name}</strong>
                {c.author?.id === user?.id && (
                  <span style={{ fontSize: 11, color: 'var(--primary)', background: '#dbeafe', padding: '1px 7px', borderRadius: 10 }}>You</span>
                )}
              </div>
              <small style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                {new Date(c.createdAt).toLocaleString()}
              </small>
            </div>

            {editingComment?.id === c.id
              ? <div>
                  <textarea className="form-control" rows={2} value={editingComment.content}
                    onChange={e => setEditingComment(prev => ({ ...prev, content: e.target.value }))} />
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => handleUpdateComment(c.id)}>Save</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditingComment(null)}>Cancel</button>
                  </div>
                </div>
              : <p style={{ fontSize: 14, margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{c.content}</p>
            }

            {c.author?.id === user?.id && editingComment?.id !== c.id && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditingComment({ id: c.id, content: c.content })}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteComment(c.id)}>Delete</button>
              </div>
            )}
          </div>
        ))}

        {/* Add comment */}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Add a Comment</label>
          <textarea className="form-control" placeholder="Write your comment here..." value={newComment}
            onChange={e => setNewComment(e.target.value)} rows={3} />
          <button className="btn btn-primary" style={{ marginTop: 8 }}
            onClick={handleAddComment} disabled={!newComment.trim()}>
            Post Comment
          </button>
        </div>
      </div>
    </div>
  )
}
