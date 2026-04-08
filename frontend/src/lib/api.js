const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
  }
}

async function parseError(response) {
  try {
    const data = await response.json()
    if (typeof data?.detail === 'string') {
      return data.detail
    }
    if (Array.isArray(data?.detail)) {
      return data.detail.map((item) => item.msg).join(', ')
    }
  } catch {
    return `Request failed with status ${response.status}`
  }
  return `Request failed with status ${response.status}`
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options)

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export function loginApi(email, password) {
  const formData = new URLSearchParams()
  formData.append('username', email)
  formData.append('password', password)

  return apiRequest('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  })
}

export function meApi(token) {
  return apiRequest('/auth/me', {
    method: 'GET',
    headers: authHeaders(token),
  })
}

export function registerUserApi(token, payload) {
  return apiRequest('/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
    body: JSON.stringify(payload),
  })
}

export function adminCheckApi(token) {
  return apiRequest('/auth/admin-check', {
    method: 'GET',
    headers: authHeaders(token),
  })
}

export function listUsersApi(token) {
  return apiRequest('/auth/users', {
    method: 'GET',
    headers: authHeaders(token),
  })
}

export function createTaskApi(token, payload) {
  return apiRequest('/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
    body: JSON.stringify(payload),
  })
}

export function listTasksApi(token, filters = {}) {
  const params = new URLSearchParams()
  if (filters.status) params.append('status', filters.status)
  if (filters.assigned_to) params.append('assigned_to', String(filters.assigned_to))
  if (filters.page) params.append('page', String(filters.page))
  if (filters.page_size) params.append('page_size', String(filters.page_size))

  const query = params.toString() ? `?${params.toString()}` : ''
  return apiRequest(`/tasks${query}`, {
    method: 'GET',
    headers: authHeaders(token),
  })
}

export function updateTaskStatusApi(token, taskId, status) {
  return apiRequest(`/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
    body: JSON.stringify({ status }),
  })
}

export function uploadDocumentApi(token, { title, file }) {
  const form = new FormData()
  form.append('title', title)
  form.append('file', file)

  return apiRequest('/documents', {
    method: 'POST',
    headers: authHeaders(token),
    body: form,
  })
}

export function searchApi(token, payload) {
  return apiRequest('/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
    body: JSON.stringify(payload),
  })
}

export function analyticsApi(token) {
  return apiRequest('/analytics', {
    method: 'GET',
    headers: authHeaders(token),
  })
}
