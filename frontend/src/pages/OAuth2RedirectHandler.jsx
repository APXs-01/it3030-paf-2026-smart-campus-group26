// Member 4: Notifications, Roles & OAuth
// Branch: feature/oauth-integration-security
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function OAuth2RedirectHandler() {
  const [params] = useSearchParams()
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const token = params.get('token')
    if (token) {
      login(token)
        .then(() => navigate('/dashboard'))
        .catch(() => navigate('/login'))
    } else {
      navigate('/login')
    }
  }, [])

  return <div className="loading-center"><div className="spinner" /></div>
}
