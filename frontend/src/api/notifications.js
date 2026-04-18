// Member 4: Notifications, Roles & OAuth
// Branch: feature/notification-service-alerts
import api from './axios'
export const getNotifications = () => api.get('/notifications')
export const getUnreadCount = () => api.get('/notifications/unread-count')
export const markAsRead = (id) => api.patch(`/notifications/${id}/read`)
export const markAllAsRead = () => api.patch('/notifications/read-all')
export const getPreferences = () => api.get('/notifications/preferences')
export const updatePreferences = (disabled) => api.put('/notifications/preferences', { disabled })
