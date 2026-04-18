// Member 4: Notifications, Roles & OAuth
// Branch: feature/notification-service-alerts
import { useEffect, useRef, useState } from 'react'
import { getNotifications, markAsRead, markAllAsRead } from '../api/notifications'

export default function NotificationPanel() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const ref = useRef(null)

  const load = () => getNotifications().then(r => setNotifications(r.data)).catch(() => {})
  const unread = notifications.filter(n => !n.isRead).length

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000) // poll every 30s
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const handleMarkRead = (id) => {
    markAsRead(id).then(() =>
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    )
  }

  const handleMarkAll = () => {
    markAllAsRead().then(() =>
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    )
  }

  const TYPE_ICON = {
    BOOKING_APPROVED: '✅',
    BOOKING_REJECTED: '❌',
    BOOKING_CANCELLED: '🚫',
    TICKET_STATUS_CHANGED: '🎫',
    TICKET_ASSIGNED: '👤',
    TICKET_COMMENT_ADDED: '💬',
    GENERAL: '📢',
  }

  return (
    <div className="notif-wrapper" ref={ref}>
      <button className="notif-btn" onClick={() => { setOpen(!open); if (!open) load() }} aria-label="Notifications">
        🔔
        {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-header">
            <strong>Notifications {unread > 0 && <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700 }}>({unread} new)</span>}</strong>
            {unread > 0 && <button className="btn-link" onClick={handleMarkAll}>Mark all read</button>}
          </div>
          <div className="notif-list">
            {notifications.length === 0
              ? <div className="notif-empty">
                  <span>🔔</span>
                  <p>You're all caught up!</p>
                </div>
              : notifications.map(n => (
                <div
                  key={n.id}
                  className={`notif-item ${n.isRead ? '' : 'unread'}`}
                  onClick={() => !n.isRead && handleMarkRead(n.id)}
                >
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 16, flex: '0 0 auto', marginTop: 1 }}>
                      {TYPE_ICON[n.type] || '📢'}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ wordBreak: 'break-word' }}>{n.message}</p>
                      <small>{new Date(n.createdAt).toLocaleString()}</small>
                    </div>
                    {!n.isRead && (
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flex: '0 0 auto', marginTop: 4 }} />
                    )}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  )
}
