// Member 4: Notifications, Roles & OAuth
// Branch: feature/role-based-access-control
import api from './axios'

export const getAllUsers = () => api.get('/users')
export const getUser = (id) => api.get(`/users/${id}`)
export const updateUserRole = (id, role) => api.patch(`/users/${id}/role`, { role })
export const updateMyProfile = (data) => api.patch('/users/me', data)
export const uploadAvatar = (formData) => api.post('/users/me/avatar', formData)
export const deleteMyAccount = () => api.delete('/users/me')
