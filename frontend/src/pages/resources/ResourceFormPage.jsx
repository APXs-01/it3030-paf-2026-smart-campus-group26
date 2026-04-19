// Member 1: Facilities & Resource Management
// Branch: feature/facilities-inventory-ui
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createResource, getResource, updateResource } from '../../api/resources'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function buildAvailabilityString(a) {
  if (!a.fromDay || !a.toDay || !a.startTime || !a.endTime) return ''
  return `${a.fromDay}-${a.toDay} ${a.startTime}-${a.endTime}`
}

function parseAvailabilityString(str) {
  const match = str?.match(/^(\w+)-(\w+)\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/)
  if (match) return { fromDay: match[1], toDay: match[2], startTime: match[3], endTime: match[4] }
  return { fromDay: 'Mon', toDay: 'Fri', startTime: '08:00', endTime: '18:00' }
}

export default function ResourceFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [form, setForm] = useState({
    name: '', type: 'LECTURE_HALL', capacity: '', location: '',
    description: '', status: 'ACTIVE'
  })
  const [avail, setAvail] = useState({ fromDay: 'Mon', toDay: 'Fri', startTime: '08:00', endTime: '18:00' })
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEdit) getResource(id).then(r => {
      const d = r.data
      setForm({
        name: d.name, type: d.type, capacity: d.capacity ?? '',
        location: d.location, description: d.description ?? '', status: d.status
      })
      if (d.availabilityWindows) setAvail(parseAvailabilityString(d.availabilityWindows))
      if (d.imageUrls) setExistingImages(d.imageUrls)
    })
  }, [id])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setA = (k, v) => setAvail(a => ({ ...a, [k]: v }))

  const handleImages = (e) => {
    const selected = Array.from(e.target.files).slice(0, 3)
    setImages(selected)
    setPreviews(selected.map(f => URL.createObjectURL(f)))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const payload = {
      ...form,
      capacity: form.capacity ? Number(form.capacity) : null,
      availabilityWindows: buildAvailabilityString(avail)
    }
    try {
      isEdit
        ? await updateResource(id, payload, images.length ? images : null)
        : await createResource(payload, images.length ? images : null)
      navigate('/resources')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save resource')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <div className="page-header"><h1>{isEdit ? 'Edit Resource' : 'Add Resource'}</h1></div>
      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Type *</label>
            <select className="form-control" value={form.type} onChange={e => set('type', e.target.value)}>
              {['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Location *</label>
            <input className="form-control" value={form.location} onChange={e => set('location', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Capacity</label>
            <input className="form-control" type="number" min="1" value={form.capacity} onChange={e => set('capacity', e.target.value)} />
          </div>

          {/* Availability Windows — day + time selectors */}
          <div className="form-group">
            <label>Availability Windows</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <small style={{ color: 'var(--text-muted)' }}>From Day</small>
                <select className="form-control" value={avail.fromDay} onChange={e => setA('fromDay', e.target.value)}>
                  {DAYS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <small style={{ color: 'var(--text-muted)' }}>To Day</small>
                <select className="form-control" value={avail.toDay} onChange={e => setA('toDay', e.target.value)}>
                  {DAYS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <small style={{ color: 'var(--text-muted)' }}>Start Time</small>
                <input className="form-control" type="time" value={avail.startTime} onChange={e => setA('startTime', e.target.value)} />
              </div>
              <div>
                <small style={{ color: 'var(--text-muted)' }}>End Time</small>
                <input className="form-control" type="time" value={avail.endTime} onChange={e => setA('endTime', e.target.value)} />
              </div>
            </div>
            <small style={{ color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
              Preview: <strong>{buildAvailabilityString(avail) || '—'}</strong>
            </small>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Status *</label>
            <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)}>
              {['ACTIVE', 'OUT_OF_SERVICE', 'MAINTENANCE'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Image upload */}
          <div className="form-group">
            <label>Images (max 3)</label>
            <input className="form-control" type="file" accept="image/*" multiple onChange={handleImages} />
            <small style={{ color: 'var(--text-muted)' }}>Upload up to 3 images for this resource.</small>
            {previews.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                {previews.map((src, i) => (
                  <img key={i} src={src} alt={`preview ${i + 1}`}
                    style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
                ))}
              </div>
            )}
            {isEdit && existingImages.length > 0 && previews.length === 0 && (
              <div>
                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: 6 }}>Current images:</small>
                <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                  {existingImages.map((url, i) => (
                    <img key={i} src={`http://localhost:8081${url}`} alt={`image ${i + 1}`}
                      style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
            <button className="btn btn-secondary" type="button" onClick={() => navigate('/resources')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
