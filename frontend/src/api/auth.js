import api from './axios'
export const getMe = () => api.get('/auth/me')
export const loginWithEmail = (email, password) => api.post('/auth/login', { email, password })
export const sendOtp = (email) => api.post('/auth/send-otp', { email })
export const registerWithEmail = (name, email, password, otp) => api.post('/auth/register', { name, email, password, otp })
