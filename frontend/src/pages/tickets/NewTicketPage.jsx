// Member 3: Incident Tickets & Technician Updates
// Branch: feature/incident-ticketing-system
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTicket } from '../../api/tickets'
import { getResources } from '../../api/resources'

export default function NewTicketPage() {
  const navigate = useNavigate()
  const [resources, setResources] = useState([])
  const [form, setForm] = useState({
    resourceId: '', location: '', category: 'IT_EQUIPMENT',
    description: '', priority: 'MEDIUM', contactDetails: ''
  })
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { getResources().then(r => setResources(r.data)) }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('ticket', new Blob(
        [JSON.stringify({ ...form, resourceId: form.resourceId ? Number(form.resourceId) : null })],
        { type: 'application/json' }
      ))
      files.forEach(f => fd.append('files', f))
      await createTicket(fd)
      navigate('/tickets/my')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <div className="page-header"><h1>Report an Issue</h1></div>
      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Related Resource (optional)</label>
            <select className="form-control" value={form.resourceId} onChange={e => set('resourceId', e.target.value)}>
              <option value="">None</option>
              {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Location *</label>
            <input className="form-control" value={form.location} onChange={e => set('location', e.target.value)} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Category *</label>
              <select className="form-control" value={form.category} onChange={e => set('category', e.target.value)}>
                {['ELECTRICAL', 'PLUMBING', 'IT_EQUIPMENT', 'FURNITURE', 'HVAC', 'SAFETY', 'OTHER'].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Priority *</label>
              <select className="form-control" value={form.priority} onChange={e => set('priority', e.target.value)}>
                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Description *</label>
            <textarea className="form-control" value={form.description} onChange={e => set('description', e.target.value)} rows={4} required />
          </div>
          <div className="form-group">
            <label>Contact Details</label>
            <input className="form-control" placeholder="Phone or email" value={form.contactDetails} onChange={e => set('contactDetails', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Attachments (max 3 images)</label>
            <input
              className="form-control" type="file" accept="image/*" multiple
              onChange={e => {
                const selected = Array.from(e.target.files).slice(0, 3)
                setFiles(selected)
                setPreviews(selected.map(f => URL.createObjectURL(f)))
              }}
            />
            {previews.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                {previews.map((src, i) => (
                  <img key={i} src={src} alt={`preview ${i + 1}`}
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
                ))}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Ticket'}</button>
            <button className="btn btn-secondary" type="button" onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
