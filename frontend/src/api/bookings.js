// Member 2: Booking Workflow & Conflict Checking
// Branch: feature/booking-reservation-core
import api from './axios'
export const createBooking = (data) => api.post('/bookings', data)
export const getMyBookings = () => api.get('/bookings/my')
export const getAllBookings = (params) => api.get('/bookings', { params })
export const getBooking = (id) => api.get(`/bookings/${id}`)
export const reviewBooking = (id, data) => api.put(`/bookings/${id}/review`, data)
export const cancelBooking = (id) => api.patch(`/bookings/${id}/cancel`)
export const verifyCheckIn = (code) => api.get(`/bookings/verify/${code}`)
export const performCheckIn = (code) => api.patch(`/bookings/checkin/${code}`)
export const getAnalytics = () => api.get('/bookings/analytics')
