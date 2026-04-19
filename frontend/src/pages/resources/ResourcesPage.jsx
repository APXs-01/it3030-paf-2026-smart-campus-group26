// Member 1: Facilities & Resource Management
// Branch: feature/facilities-inventory-ui
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getResources, deleteResource } from '../../api/resources'
import { useAuth } from '../../context/AuthContext'

const TYPES = ['', 'LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT']
const STATUSES = ['', 'ACTIVE', 'OUT_OF_SERVICE', 'MAINTENANCE']

function typeIcon(type) {
  const icons = { LECTURE_HALL: '🎓', LAB: '🔬', MEETING_ROOM: '🤝', EQUIPMENT: '📷' }
  return icons[type] || '🏢'
}

function typeLabel(type) {
  const labels = { LECTURE_HALL: 'Lecture Hall', LAB: 'Laboratory', MEETING_ROOM: 'Meeting Room', EQUIPMENT: 'Equipment' }
  return labels[type] || type
}

function statusColor(status) {
  const colors = { ACTIVE: '#22c55e', OUT_OF_SERVICE: '#ef4444', MAINTENANCE: '#f59e0b' }
  return colors[status] || '#6b7280'
}

function ImageCarousel({ urls }) {
  const [idx, setIdx] = useState(0)
  if (!urls || urls.length === 0) {
    return (
      <div style={{
        width: '100%', height: 180, background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 48, borderRadius: '12px 12px 0 0'
      }}>
        🏢
      </div>
    )
  }
  return (
    <div style={{ position: 'relative', width: '100%', height: 180, borderRadius: '12px 12px 0 0', overflow: 'hidden' }}>
      <img
        src={`http://localhost:8081${urls[idx]}`}
        alt={`image ${idx + 1}`}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'opacity 0.2s' }}
      />
      {urls.length > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); setIdx(i => (i - 1 + urls.length) % urls.length) }}
            style={{
              position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff',
              borderRadius: '50%', width: 28, height: 28, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14
            }}
          >‹</button>
          <button
            onClick={(e) => { e.preventDefault(); setIdx(i => (i + 1) % urls.length) }}
            style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff',
              borderRadius: '50%', width: 28, height: 28, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14
            }}
          >›</button>
          <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5 }}>
            {urls.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.preventDefault(); setIdx(i) }}
                style={{
                  width: i === idx ? 18 : 7, height: 7, borderRadius: 4,
                  background: i === idx ? '#fff' : 'rgba(255,255,255,0.5)',
                  border: 'none', cursor: 'pointer', padding: 0,
                  transition: 'all 0.2s'
                }}
              />
            ))}
          </div>
        </>
      )}
      <div style={{
        position: 'absolute', top: 10, right: 10,
        background: 'rgba(0,0,0,0.6)', color: '#fff',
        borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600
      }}>
        {typeIcon(null)} {urls.length} photo{urls.length > 1 ? 's' : ''}
      </div>
    </div>
  )
}

export default function ResourcesPage() {
  const { isAdmin } = useAuth()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ type: '', status: '', location: '' })

  const load = () => {
    setLoading(true)
    const params = {}
    if (filters.type) params.type = filters.type
    if (filters.status) params.status = filters.status
    if (filters.location) params.location = filters.location
    getResources(params).then(r => setResources(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filters.type, filters.status])

  const handleDelete = (id) => {
    if (confirm('Delete this resource?')) deleteResource(id).then(load)
  }

  return (
    <div>
      <div className="page-hero-banner" style={{ backgroundImage: 'url(/hero_bg.png)' }}>
        <div className="page-hero-content">
          <h1>Facilities &amp; Resources</h1>
          <p>Browse, manage, and provision campus assets with our dynamic visual grid system.</p>
          <div>
            {isAdmin() && <Link to="/admin/resources/new" className="btn btn-primary" style={{marginTop: 14}}>+ Add Resource</Link>}
          </div>
        </div>
      </div>
      <div className="filters">
        <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
          {TYPES.map(t => <option key={t} value={t}>{t || 'All Types'}</option>)}
        </select>
        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
        <input
          placeholder="Filter by location..."
          value={filters.location}
          onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
        />
        <button className="btn btn-secondary" onClick={load}>Search</button>
      </div>
      {loading
        ? <div className="loading-center"><div className="spinner" /></div>
        : resources.length === 0
          ? <div className="empty-state"><p>No resources found.</p></div>
          : <div className="grid-3">
            {resources.map(r => (
              <div key={r.id} style={{
                background: 'var(--card-bg, #fff)',
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.13), 0 0 0 1px rgba(0,0,0,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)' }}
              >
                <ImageCarousel urls={r.imageUrls} />

                <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* Header row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.name}
                      </h3>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        {typeIcon(r.type)} {typeLabel(r.type)}
                      </div>
                    </div>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      background: statusColor(r.status) + '1a',
                      color: statusColor(r.status),
                      border: `1px solid ${statusColor(r.status)}40`,
                      borderRadius: 20, padding: '3px 10px',
                      fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', marginLeft: 8
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor(r.status), display: 'inline-block' }} />
                      {r.status}
                    </span>
                  </div>

                  {/* Meta info */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      📍 {r.location}
                    </span>
                    {r.capacity && (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        👥 {r.capacity} seats
                      </span>
                    )}
                    {r.availabilityWindows && (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        🕐 {r.availabilityWindows}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {r.description && (
                    <p style={{
                      fontSize: 13, color: 'var(--text-secondary, #555)',
                      margin: 0, lineHeight: 1.5,
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                      {r.description}
                    </p>
                  )}

                  {/* Spacer */}
                  <div style={{ flex: 1 }} />

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, paddingTop: 4, borderTop: '1px solid var(--border, #eee)', marginTop: 4 }}>
                    {r.status === 'ACTIVE' && (
                      <Link to={`/bookings/new?resourceId=${r.id}`} className="btn btn-primary btn-sm" style={{ flex: 1, textAlign: 'center' }}>
                        Book Now
                      </Link>
                    )}
                    {isAdmin() && <>
                      <Link to={`/admin/resources/edit/${r.id}`} className="btn btn-secondary btn-sm">Edit</Link>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>Delete</button>
                    </>}
                  </div>
                </div>
              </div>
            ))}
          </div>
      }
    </div>
  )
}
