/**
 * Thin fetch wrapper: attaches the JWT, throws on non-2xx, and centralizes
 * the base URL so the whole app has one place to change if the backend
 * moves (Code Quality: separation between presentation and logic layers).
 */
const BASE_URL = '/api'

function authHeaders() {
  const token = localStorage.getItem('access_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {}),
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `Request failed: ${res.status}`)
  }
  const contentType = res.headers.get('content-type') || ''
  return contentType.includes('application/json') ? res.json() : res
}

export const api = {
  async login(email, password) {
    const form = new URLSearchParams()
    form.append('username', email)
    form.append('password', password)
    const res = await fetch(`${BASE_URL}/auth/login`, { method: 'POST', body: form })
    if (!res.ok) throw new Error('Invalid credentials')
    return res.json()
  },
  me: () => request('/auth/me'),

  campaigns: {
    list: () => request('/campaigns'),
    get: (id) => request(`/campaigns/${id}`),
    create: (data) => request('/campaigns', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => request(`/campaigns/${id}`, { method: 'DELETE' }),
  },

  donations: {
    // Doesn't use request(): a declined card is an expected outcome (M1.6),
    // not an exceptional one, so this resolves to a tagged result either way
    // instead of throwing.
    async create(data) {
      let res
      try {
        res = await fetch(`${BASE_URL}/donations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      } catch {
        return { ok: false, reason: 'offline' }
      }
      const body = await res.json().catch(() => ({}))
      if (res.ok) return { ok: true, transaction: body }
      if (res.status === 402) return { ok: false, reference: body.detail?.reference, reason: body.detail?.reason }
      return { ok: false, reason: 'offline', message: body.detail }
    },
  },

  transactions: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString()
      return request(`/transactions${qs ? `?${qs}` : ''}`)
    },
    create: (data) => request('/transactions', { method: 'POST', body: JSON.stringify(data) }),
    exportCsvUrl: () => `${BASE_URL}/transactions/export/csv`,
    exportPdfUrl: () => `${BASE_URL}/transactions/export/pdf`,
  },

  dashboard: {
    stats: () => request('/dashboard/stats'),
  },

  reconciliation: {
    get: () => request('/reconciliation'),
  },

  audit: {
    list: () => request('/audit'),
  },
}
