export const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export function getToken() {
  return localStorage.getItem('bm_token')
}

export function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` }
}

export async function apiFetch(url, options = {}) {
  const res = await fetch(`${API}${url}`, {
    ...options,
    headers: { ...authHeaders(), ...options.headers }
  })
  if (res.status === 401) {
    localStorage.removeItem('bm_token')
    window.location.reload()
  }
  return res
}
