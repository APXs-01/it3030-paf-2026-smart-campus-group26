// Member 2: Booking Workflow & Conflict Checking
// Branch: feature/booking-calendar-view
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { createBooking } from '../../api/bookings'
import { getResources } from '../../api/resources'

export default function NewBookingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [resources, setResources] = useState([])
  const [form, setForm] = useState({
    resourceId: searchParams.get('resourceId') || '',
    bookingDate: '', startTime: '', endTime: '', purpose: '', attendeeCount: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getResources({ status: 'ACTIVE' }).then(r => setResources(r.data))
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        ...form,
        resourceId: Number(form.resourceId),
        attendeeCount: form.attendeeCount ? Number(form.attendeeCount) : null
      }
      await createBooking(payload)
      navigate('/bookings/my')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <div className="page-header"><h1>New Booking</h1></div>
      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Resource *</label>
            <select className="form-control" value={form.resourceId} onChange={e => set('resourceId', e.target.value)} required>
              <option value="">Select a resource</option>
              {resources.map(r => <option key={r.id} value={r.id}>{r.name} — {r.location}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Date *</label>
            <input className="form-control" type="date" value={form.bookingDate}
              onChange={e => set('bookingDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]} required />
          </div>
          <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Start Time *</label>
              <input className="form-control" type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>End Time *</label>
              <input className="form-control" type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label>Purpose *</label>
            <textarea className="form-control" value={form.purpose} onChange={e => set('purpose', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Expected Attendees</label>
            <input className="form-control" type="number" value={form.attendeeCount} onChange={e => set('attendeeCount', e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Booking'}</button>
            <button className="btn btn-secondary" type="button" onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
