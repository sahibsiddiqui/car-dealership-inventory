const STORAGE_KEY = 'dealership_auth'

export function loadAuth() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}
export const saveAuth = (auth) => localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
export const clearAuth = () => localStorage.removeItem(STORAGE_KEY)

async function request(path, { method = 'GET', body } = {}) {
  const auth = loadAuth()
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth?.token) headers.Authorization = `Bearer ${auth.token}`

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (res.status === 204) return null

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const error = new Error(data.error || 'Something went wrong')
    error.status = res.status
    throw error
  }
  return data
}

export const api = {
  register: (email, password) => request('/auth/register', { method: 'POST', body: { email, password } }),
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  searchVehicles: (filters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value != null) params.set(key, value)
    })
    const qs = params.toString()
    return request(`/vehicles/search${qs ? `?${qs}` : ''}`)
  },
  createVehicle: (vehicle) => request('/vehicles', { method: 'POST', body: vehicle }),
  updateVehicle: (id, vehicle) => request(`/vehicles/${id}`, { method: 'PUT', body: vehicle }),
  deleteVehicle: (id) => request(`/vehicles/${id}`, { method: 'DELETE' }),
  purchaseVehicle: (id, quantity = 1) => request(`/vehicles/${id}/purchase`, { method: 'POST', body: { quantity } }),
  restockVehicle: (id, quantity) => request(`/vehicles/${id}/restock`, { method: 'POST', body: { quantity } }),
}