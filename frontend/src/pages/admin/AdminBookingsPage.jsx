// Member 2: Booking Workflow & Conflict Checking
// Branch: feature/conflict-validation-logic
import { useEffect, useState } from 'react'
import { getAllBookings, reviewBooking } from '../../api/bookings'

const STATUS_COLOR = {
  PENDING:   { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  APPROVED:  { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  REJECTED:  { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
  CANCELLED: { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },
}
const ALL_STATUSES = ['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']

function StatusBadge({ status }) {
  const s = STATUS_COLOR[status] || STATUS_COLOR.CANCELLED
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: s.bg, color: s.color, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }} />
      {status}
    </span>
  )
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [reason, setReason] = useState({})
  const [working, setWorking] = useState({})

  const load = () => {
    setLoading(true)
    getAllBookings(filter ? { status: filter } : {}).then(r => setBookings(r.data)).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [filter])

  const handleReview = async (id, approved) => {
    setWorking(w => ({ ...w, [id]: true }))
    try {
      await reviewBooking(id, { approved, reason: reason[id] || '' })
      load()
    } finally {
      setWorking(w => ({ ...w, [id]: false }))
    }
  }

  const pendingCount = bookings.filter(b => b.status === 'PENDING').length

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Manage Bookings</h1>
          {pendingCount > 0 && !loading && (
            <p style={{ fontSize: 13, color: 'var(--warning)', fontWeight: 600, marginTop: 4 }}>
              ⏳ {pendingCount} booking{pendingCount > 1 ? 's' : ''} awaiting review
            </p>
          )}
        </div>
      </div>

      <div className="filters">
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
      </div>

      {loading
        ? <div className="loading-center"><div className="spinner" /></div>
        : bookings.length === 0
          ? <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <p>No bookings found.</p>
            </div>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {bookings.map(b => (
                <div key={b.id} className="card" style={{
                  borderLeft: `4px solid ${STATUS_COLOR[b.status]?.dot || '#94a3b8'}`
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 14, marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Booked By</div>
                      <div style={{ fontWeight: 600 }}>{b.user?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.user?.email}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Resource</div>
                      <div style={{ fontWeight: 600 }}>{b.resource?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>📍 {b.resource?.location}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Date & Time</div>
                      <div style={{ fontWeight: 600 }}>
                        {new Date(b.bookingDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {b.startTime} – {b.endTime}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Status</div>
                      <StatusBadge status={b.status} />
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: b.status === 'PENDING' ? 14 : 0, lineHeight: 1.5 }}>
                    <strong>Purpose:</strong> {b.purpose}
                    {b.attendeeCount && <span> &bull; 👥 {b.attendeeCount} attendees</span>}
                  </p>

                  {b.rejectionReason && (
                    <div style={{ padding: '8px 12px', background: '#fff5f5', borderRadius: 6, borderLeft: '3px solid #ef4444', fontSize: 13, color: '#991b1b', marginBottom: 0 }}>
                      <strong>Rejection reason:</strong> {b.rejectionReason}
                    </div>
                  )}

                  {b.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                      <input
                        className="form-control"
                        style={{ fontSize: 13, flex: '1 1 200px', minWidth: 160 }}
                        placeholder="Rejection reason (optional)..."
                        value={reason[b.id] || ''}
                        onChange={e => setReason(r => ({ ...r, [b.id]: e.target.value }))}
                      />
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleReview(b.id, true)}
                        disabled={working[b.id]}
                      >
                        ✓ Approve
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleReview(b.id, false)}
                        disabled={working[b.id]}
                      >
                        ✗ Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
      }
    </div>
  )
}
