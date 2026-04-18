// Member 4: Notifications, Roles & OAuth
// Branch: feature/oauth-integration-security
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loginWithEmail, sendOtp, registerWithEmail } from '../api/auth'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState('login') // 'login' | 'register' | 'otp'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Step 1 for register: send OTP
  async function handleRegisterSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await sendOtp(email)
      setMode('otp')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send verification email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2 for register: verify OTP and create account
  async function handleOtpSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await registerWithEmail(name, email, password, otp)
      await login(res.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleLoginSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await loginWithEmail(email, password)
      await login(res.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  function switchMode(next) {
    setMode(next)
    setError('')
    setOtp('')
  }
  return (
    <div className="login-page">
      <div className="login-split">
        {/* Left panel — branding */}
        <div className="login-left">
          <div className="login-left-inner">
            <div className="login-logo-ring">🏛️</div>
            <h1>Smart Campus<br />Operations Hub</h1>
            <p>
              The unified platform for managing campus facilities,
              bookings, and incident resolution — built for SLIIT.
            </p>
            <div className="login-features">
              {[
                ['🏢', 'Manage rooms, labs & equipment'],
                ['📅', 'Book resources with conflict detection'],
                ['🔧', 'Track & resolve maintenance tickets'],
                ['🔔', 'Real-time notifications & updates'],
              ].map(([icon, text]) => (
                <div key={text} className="login-feature">
                  <div className="login-feature-icon">{icon}</div>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel — sign in / register / otp */}
        <div className="login-right">
          <div className="login-form-inner">
            <div style={{ fontSize: 36, marginBottom: 16 }}>🏫</div>

            {/* ── OTP verification step ── */}
            {mode === 'otp' ? (<>
              <h2>Check your email</h2>
              <p>We sent a 6-digit code to <strong>{email}</strong>. Enter it below to complete registration.</p>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', textAlign: 'left' }} onSubmit={handleOtpSubmit}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Verification Code</label>
                  <input type="text" className="form-control" placeholder="123456" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} required autoFocus style={{ letterSpacing: '0.25em', fontSize: '20px', textAlign: 'center' }} />
                </div>
                {error && (
                  <div style={{ fontSize: '13px', color: '#e53e3e', background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '6px', padding: '10px 12px' }}>
                    {error}
                  </div>
                )}
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px', padding: '12px' }} disabled={loading}>
                  {loading ? 'Verifying…' : 'Verify & Create Account'}
                </button>
                <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                  Wrong email?{' '}
                  <button type="button" onClick={() => switchMode('register')} style={{ background: 'none', border: 'none', color: 'var(--secondary)', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: '13px' }}>
                    Go back
                  </button>
                </p>
              </form>
            </>) : (<>
              {/* ── Login / Register step ── */}
              <h2>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
              <p>{mode === 'login' ? 'Sign in to access your campus operations dashboard.' : 'Register a new local account.'}</p>

              <form style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', textAlign: 'left' }} onSubmit={mode === 'login' ? handleLoginSubmit : handleRegisterSubmit}>
                {mode === 'register' && (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Full Name</label>
                    <input type="text" className="form-control" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                )}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Email Address</label>
                  <input type="email" className="form-control" placeholder="name@domain.edu" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Password</label>
                  <input type="password" className="form-control" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                {error && (
                  <div style={{ fontSize: '13px', color: '#e53e3e', background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '6px', padding: '10px 12px' }}>
                    {error}
                  </div>
                )}
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px', padding: '12px' }} disabled={loading}>
                  {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Send Verification Code'}
                </button>
                <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button type="button" onClick={() => switchMode(mode === 'login' ? 'register' : 'login')} style={{ background: 'none', border: 'none', color: 'var(--secondary)', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: '13px' }}>
                    {mode === 'login' ? 'Register' : 'Sign In'}
                  </button>
                </p>
              </form>
            </>)}

            {mode !== 'otp' && <>
              <div className="login-divider">or continue with</div>

              <a href="/oauth2/authorize/google" className="btn-google">
                <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Continue with Google
              </a>

            </>}

            <div className="login-footer">
              By signing in, you agree to the usage policies of<br />
              <strong>SLIIT Smart Campus Operations Hub</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

