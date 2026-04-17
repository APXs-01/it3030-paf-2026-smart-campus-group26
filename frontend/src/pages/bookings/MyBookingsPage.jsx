// Member 2: Booking Workflow & Conflict Checking
// Branch: feature/booking-reservation-core
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import { getMyBookings, cancelBooking } from '../../api/bookings'

const STATUS_COLOR = {
  PENDING: { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  APPROVED: { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  REJECTED: { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
  CANCELLED: { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },
}

function StatusBadge({ status }) {
  const s = STATUS_COLOR[status] || STATUS_COLOR.CANCELLED
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: s.bg, color: s.color, borderRadius: 20,
      padding: '3px 10px', fontSize: 11, fontWeight: 700
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }} />
      {status}
    </span>
  )
}

function QRModal({ booking, onClose }) {
  const canvasRef = useRef(null)
  if (!booking) return null

  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `booking-${booking.id}-qr.png`
    a.click()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box qr-modal" onClick={e => e.stopPropagation()}>
        <div className="qr-modal-header">
          <div>
            <h3>Check-in QR Code</h3>
            <p>{booking.resource?.name} &mdash; {booking.bookingDate}</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="qr-modal-body">
          {booking.checkedIn ? (
            <div className="qr-checked-in">
              <div className="qr-checked-in-icon">✅</div>
              <strong>Already Checked In</strong>
              <p>This booking has been verified.</p>
            </div>
          ) : (
            <>
              <div className="qr-code-wrapper" ref={canvasRef}>
                <QRCodeCanvas value={booking.checkInCode} size={200} level="H" />
              </div>
              <button
                onClick={handleDownload}
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: 10, fontSize: 13 }}
              >
                ⬇ Download QR Code
              </button>
            </>
          )}

          <div className="qr-details">
            <div className="qr-detail-row">
              <span>Resource</span><strong>{booking.resource?.name}</strong>
            </div>
            <div className="qr-detail-row">
              <span>Location</span><strong>{booking.resource?.location}</strong>
            </div>
            <div className="qr-detail-row">
              <span>Date</span>
              <strong>{new Date(booking.bookingDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
            </div>
            <div className="qr-detail-row">
              <span>Time</span><strong>{booking.startTime} – {booking.endTime}</strong>
            </div>
            <div className="qr-detail-row">
              <span>Purpose</span><strong>{booking.purpose}</strong>
            </div>
          </div>

          <p className="qr-hint">Show this QR code to the facility admin at check-in.</p>
        </div>
      </div>
    </div>
  )
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [qrBooking, setQrBooking] = useState(null)

  const load = () => {
    setLoading(true)
    getMyBookings().then(r => setBookings(r.data)).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handleCancel = (id) => {
    if (confirm('Cancel this booking?')) cancelBooking(id).then(load)
  }

  return (
    <div>
      <div className="page-hero-banner" style={{ backgroundImage: 'url(/hero_bg.png)' }}>
        <div className="page-hero-content">
          <h1>My Bookings</h1>
          <p>Your comprehensive agenda for upcoming meetings, lecture halls, and secure facilities.</p>
          <div>
            <Link to="/bookings/new" className="btn btn-primary" style={{marginTop: 14}}>+ New Booking</Link>
          </div>
        </div>
      </div>

      {loading
        ? <div className="loading-center"><div className="spinner" /></div>
        : bookings.length === 0
          ? <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <p>No bookings yet.</p>
              <small>Reserve a campus resource to get started.</small>
              <Link to="/bookings/new" className="btn btn-primary" style={{ marginTop: 8 }}>
                Make a Booking
              </Link>
            </div>
          : (
            <>
              {/* Desktop table */}
              <div className="card table-container" style={{ display: 'block' }}>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Resource</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Purpose</th>
                      <th>Attendees</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id}>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>#{b.id}</td>
                        <td>
                          <strong style={{ display: 'block' }}>{b.resource?.name}</strong>
                          <small style={{ color: 'var(--text-muted)' }}>📍 {b.resource?.location}</small>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {new Date(b.bookingDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: 13 }}>
                          {b.startTime} – {b.endTime}
                        </td>
                        <td style={{ maxWidth: 200 }}>
                          <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: 13 }}>
                            {b.purpose}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {b.attendeeCount ? <span>👥 {b.attendeeCount}</span> : <span style={{ color: 'var(--text-light)' }}>—</span>}
                        </td>
                        <td>
                          <StatusBadge status={b.status} />
                          {b.rejectionReason && (
                            <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4, maxWidth: 160 }}>
                              {b.rejectionReason}
                            </div>
                          )}
                        </td>
                        <td style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          {b.status === 'APPROVED' && (
                            <button className="btn btn-qr btn-sm" onClick={() => setQrBooking(b)}
                              title="Show QR check-in code">
                              {b.checkedIn ? '✅' : '📲'}
                            </button>
                          )}
                          {['PENDING', 'APPROVED'].includes(b.status) && (
                            <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b.id)}>
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards (hidden on desktop via media query) */}
              <div className="booking-mobile-list">
                {bookings.map(b => (
                  <div key={b.id} className="card" style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <strong style={{ fontSize: 15 }}>{b.resource?.name}</strong>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>📍 {b.resource?.location}</div>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13, marginBottom: 10 }}>
                      <div><span style={{ color: 'var(--text-muted)', fontSize: 11 }}>DATE</span><div>{b.bookingDate}</div></div>
                      <div><span style={{ color: 'var(--text-muted)', fontSize: 11 }}>TIME</span><div>{b.startTime} – {b.endTime}</div></div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>{b.purpose}</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {b.status === 'APPROVED' && (
                        <button className="btn btn-qr btn-sm" onClick={() => setQrBooking(b)}>
                          {b.checkedIn ? '✅ Checked In' : '📲 QR Check-in'}
                        </button>
                      )}
                      {['PENDING', 'APPROVED'].includes(b.status) && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b.id)}>Cancel</button>
                      )}
                    </div>
                    {b.rejectionReason && (
                      <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 8, padding: '8px 10px', background: '#fff5f5', borderRadius: 6 }}>
                        Reason: {b.rejectionReason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )
      }

      <QRModal booking={qrBooking} onClose={() => setQrBooking(null)} />
    </div>
  )
}
