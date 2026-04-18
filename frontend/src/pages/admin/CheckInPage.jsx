// Member 2: Booking Workflow & Conflict Checking — QR Check-in Verification
import { useState, useEffect, useRef } from 'react'
import { verifyCheckIn, performCheckIn } from '../../api/bookings'

/* Load jsQR from CDN the first time the camera is opened — no npm import */
function loadJsQR() {
  return new Promise((resolve, reject) => {
    if (window.jsQR) { resolve(window.jsQR); return }
    const existing = document.querySelector('script[data-jsqr]')
    if (existing) {
      existing.addEventListener('load', () => resolve(window.jsQR))
      existing.addEventListener('error', reject)
      return
    }
    const s = document.createElement('script')
    s.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js'
    s.setAttribute('data-jsqr', '1')
    s.onload = () => resolve(window.jsQR)
    s.onerror = () => reject(new Error('Failed to load QR library'))
    document.head.appendChild(s)
  })
}

function QRScanner({ onScan, onClose }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)
  const activeRef = useRef(true)
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    activeRef.current = true

    async function start() {
      let jsQR
      try {
        jsQR = await loadJsQR()
      } catch {
        setErrMsg('Could not load QR library. Check your internet connection.')
        setStatus('error')
        return
      }

      let stream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
        })
      } catch {
        setErrMsg('Camera permission denied. Please allow camera access.')
        setStatus('error')
        return
      }

      if (!activeRef.current) { stream.getTracks().forEach(t => t.stop()); return }
      streamRef.current = stream
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      setStatus('ready')

      function tick() {
        if (!activeRef.current) return
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas) return
        if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          const ctx = canvas.getContext('2d', { willReadFrequently: true })
          ctx.drawImage(video, 0, 0)
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const result = jsQR(img.data, img.width, img.height)
          if (result && result.data) {
            activeRef.current = false
            stream.getTracks().forEach(t => t.stop())
            onScan(result.data)
            return
          }
        }
        rafRef.current = requestAnimationFrame(tick)
      }
      tick()
    }

    start()

    return () => {
      activeRef.current = false
      cancelAnimationFrame(rafRef.current)
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    }
  }, [])

  return (
    <div style={{ marginBottom: 16 }}>
      {status === 'error' ? (
        <div className="alert alert-danger" style={{ marginBottom: 10 }}>
          {errMsg}
        </div>
      ) : (
        <div style={{
          position: 'relative', borderRadius: 10, overflow: 'hidden',
          border: '2px solid var(--primary)', background: '#111',
          aspectRatio: '4/3', maxHeight: 320,
        }}>
          <video
            ref={videoRef}
            muted
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {status === 'loading' && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', color: '#fff', gap: 10,
            }}>
              <div className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
              <span style={{ fontSize: 13 }}>Starting camera…</span>
            </div>
          )}
          {/* Scan aim box */}
          {status === 'ready' && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
            }}>
              <div style={{
                width: 180, height: 180,
                border: '3px solid rgba(255,255,255,0.9)',
                borderRadius: 14,
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)',
              }} />
            </div>
          )}
          <div style={{
            position: 'absolute', bottom: 10, left: 0, right: 0,
            textAlign: 'center', color: '#fff', fontSize: 12, opacity: 0.85,
          }}>
            {status === 'ready' ? 'Point at the QR code' : ''}
          </div>
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <button className="btn btn-secondary" onClick={onClose}
        style={{ marginTop: 10, width: '100%' }}>
        ✕ Close Camera
      </button>
    </div>
  )
}

export default function CheckInPage() {
  const [code, setCode] = useState('')
  const [booking, setBooking] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingIn, setCheckingIn] = useState(false)
  const [success, setSuccess] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)

  const runVerify = async (codeValue) => {
    setLoading(true)
    setError('')
    setBooking(null)
    setSuccess(false)
    try {
      const res = await verifyCheckIn(codeValue.trim())
      setBooking(res.data)
    } catch {
      setError('Invalid or unknown check-in code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleScan = (scannedCode) => {
    setScannerOpen(false)
    setCode(scannedCode)
    runVerify(scannedCode)
  }

  const handleVerify = (e) => {
    e.preventDefault()
    if (!code.trim()) return
    runVerify(code)
  }

  const handleCheckIn = async () => {
    setCheckingIn(true)
    try {
      const res = await performCheckIn(code.trim())
      setBooking(res.data)
      setSuccess(true)
    } catch (err) {
      setError(err?.response?.data?.message || 'Check-in failed.')
    } finally {
      setCheckingIn(false)
    }
  }

  const handleReset = () => {
    setCode('')
    setBooking(null)
    setError('')
    setSuccess(false)
    setScannerOpen(false)
  }

  const statusColor = {
    APPROVED: { bg: '#d1fae5', color: '#065f46' },
    PENDING:  { bg: '#fef3c7', color: '#92400e' },
    REJECTED: { bg: '#fee2e2', color: '#991b1b' },
    CANCELLED:{ bg: '#f1f5f9', color: '#475569' },
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="page-header">
        <h1>📲 QR Check-in Verification</h1>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 4, fontSize: 15 }}>Enter or Scan Check-in Code</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
          Scan the QR code with your camera or type the code manually.
        </p>

        {scannerOpen
          ? <QRScanner onScan={handleScan} onClose={() => setScannerOpen(false)} />
          : (
            <button
              className="btn btn-secondary"
              onClick={() => setScannerOpen(true)}
              style={{ width: '100%', marginBottom: 14, fontSize: 14, padding: '10px' }}
            >
              📷 Open Camera to Scan QR
            </button>
          )
        }

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>or enter manually</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <form onSubmit={handleVerify} style={{ display: 'flex', gap: 10 }}>
          <input
            className="form-input"
            placeholder="Paste or type check-in code…"
            value={code}
            onChange={e => { setCode(e.target.value); setError(''); setBooking(null); setSuccess(false) }}
            style={{ flex: 1, fontFamily: 'monospace', fontSize: 13 }}
          />
          <button className="btn btn-primary" type="submit" disabled={loading || !code.trim()}>
            {loading ? 'Verifying…' : 'Verify'}
          </button>
        </form>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>
      )}

      {booking && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0 }}>Booking #{booking.id}</h3>
            <span style={{
              padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
              background: statusColor[booking.status]?.bg,
              color: statusColor[booking.status]?.color,
            }}>
              {booking.status}
            </span>
          </div>

          <div className="checkin-details-grid">
            <div className="checkin-detail"><span>Resource</span><strong>{booking.resource?.name}</strong></div>
            <div className="checkin-detail"><span>Location</span><strong>{booking.resource?.location}</strong></div>
            <div className="checkin-detail"><span>Booked By</span><strong>{booking.user?.name}</strong></div>
            <div className="checkin-detail"><span>Email</span><strong>{booking.user?.email}</strong></div>
            <div className="checkin-detail">
              <span>Date</span>
              <strong>{new Date(booking.bookingDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
            </div>
            <div className="checkin-detail"><span>Time</span><strong>{booking.startTime} – {booking.endTime}</strong></div>
            <div className="checkin-detail"><span>Purpose</span><strong>{booking.purpose}</strong></div>
            {booking.attendeeCount && (
              <div className="checkin-detail"><span>Attendees</span><strong>{booking.attendeeCount}</strong></div>
            )}
          </div>

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            {success || booking.checkedIn ? (
              <div className="checkin-success">
                <span className="checkin-success-icon">✅</span>
                <div>
                  <strong>Checked In Successfully</strong>
                  <p>Entry granted for {booking.user?.name}.</p>
                </div>
              </div>
            ) : booking.status === 'APPROVED' ? (
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" onClick={handleCheckIn} disabled={checkingIn}
                  style={{ flex: 1, padding: '12px' }}>
                  {checkingIn ? 'Processing…' : '✅ Confirm Check-in'}
                </button>
                <button className="btn btn-secondary" onClick={handleReset}>Scan Another</button>
              </div>
            ) : (
              <div className="alert alert-danger">
                This booking is <strong>{booking.status}</strong> and cannot be checked in.
                <button className="btn btn-secondary btn-sm" onClick={handleReset} style={{ marginLeft: 12 }}>
                  Scan Another
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
