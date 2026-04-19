// Member 1: Facilities & Resource Management
// Branch: feature/resource-mgmt-endpoints
import api from './axios'

export const getResources = (params) => api.get('/resources', { params })
export const getResource = (id) => api.get(`/resources/${id}`)

export const createResource = (data, images) => {
  const fd = new FormData()
  fd.append('resource', new Blob([JSON.stringify(data)], { type: 'application/json' }))
  if (images) images.forEach(f => fd.append('images', f))
  return api.post('/resources', fd)
}

export const updateResource = (id, data, images) => {
  const fd = new FormData()
  fd.append('resource', new Blob([JSON.stringify(data)], { type: 'application/json' }))
  if (images) images.forEach(f => fd.append('images', f))
  return api.put(`/resources/${id}`, fd)
}

export const deleteResource = (id) => api.delete(`/resources/${id}`)
