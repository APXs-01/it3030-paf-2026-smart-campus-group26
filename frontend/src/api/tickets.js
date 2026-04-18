// Member 3: Incident Tickets & Technician Updates
// Branch: feature/incident-ticketing-system
import api from './axios'

export const createTicket = (formData) =>
  api.post('/tickets', formData)
export const getMyTickets = () => api.get('/tickets/my')
export const getAllTickets = (params) => api.get('/tickets', { params })
export const getTicket = (id) => api.get(`/tickets/${id}`)
export const updateTicket = (id, data) => api.patch(`/tickets/${id}`, data)
export const deleteTicket = (id) => api.delete(`/tickets/${id}`)
export const addComment = (ticketId, data) => api.post(`/tickets/${ticketId}/comments`, data)
export const updateComment = (commentId, data) => api.put(`/tickets/comments/${commentId}`, data)
export const deleteComment = (commentId) => api.delete(`/tickets/comments/${commentId}`)
