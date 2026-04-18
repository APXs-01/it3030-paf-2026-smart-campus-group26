// Member 3: Incident Tickets & Technician Updates
// Branch: feature/incident-ticketing-system
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyTickets } from '../../api/tickets'

const STATUSES = ['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED']

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

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  const load = () => {
    setLoading(true)
    getMyTickets().then(r => {
      const data = r.data
      setTickets(filter ? data.filter(t => t.status === filter) : data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter])

  return (
    <div>
      <div className="page-header">
        <h1>My Tickets</h1>
        <Link to="/tickets/new" className="btn btn-primary">+ Report Issue</Link>
      </div>

      <div className="filters">
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
      </div>

      {loading
        ? <div className="loading-center"><div className="spinner" /></div>
        : tickets.length === 0
          ? <div className="empty-state">
              <p>No tickets found.</p>
              <Link to="/tickets/new" className="btn btn-primary" style={{ marginTop: 10 }}>Report an Issue</Link>
            </div>
          : <div className="grid-2">
            {tickets.map(t => (
              <Link to={`/tickets/${t.id}`} key={t.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card ticket-card" style={{
                  borderLeft: `4px solid ${STATUS_COLOR[t.status] || '#6b7280'}`,
                  transition: 'transform 0.12s, box-shadow 0.12s',
                  cursor: 'pointer'
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <Badge value={t.status} colorMap={STATUS_COLOR} />
                    <Badge value={t.priority} colorMap={PRIORITY_COLOR} />
                  </div>

                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
                    #{t.id} — {t.category}
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>📍 {t.location}</p>
                  <p style={{ fontSize: 13, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', color: 'var(--text-secondary, #555)', lineHeight: 1.4 }}>
                    {t.description}
                  </p>

                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {t.assignedTo ? `👤 ${t.assignedTo.name}` : '👤 Unassigned'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {new Date(t.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Resolution / rejection note preview */}
                  {t.resolutionNotes && (
                    <div style={{ marginTop: 8, padding: '6px 10px', background: '#d1fae5', borderRadius: 6, fontSize: 12, color: '#166534' }}>
                      ✓ {t.resolutionNotes}
                    </div>
                  )}
                  {t.rejectionReason && (
                    <div style={{ marginTop: 8, padding: '6px 10px', background: '#fee2e2', borderRadius: 6, fontSize: 12, color: '#991b1b' }}>
                      ✗ {t.rejectionReason}
                    </div>
                  )}

                  {t.attachmentUrls?.length > 0 && (
                    <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                      📎 {t.attachmentUrls.length} attachment{t.attachmentUrls.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
      }
    </div>
  )
}
