const BASE = import.meta.env.VITE_API_URL || '';

async function request(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Request failed');
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  doctors: () => request('/doctors'),
  slots: (doctorId, date) =>
    request(`/slots?doctorId=${encodeURIComponent(doctorId)}&date=${encodeURIComponent(date)}`),
  book: (payload) => request('/appointments', { method: 'POST', body: payload }),
  login: (email, password) => request('/admin/login', { method: 'POST', body: { email, password } }),
  adminList: (token, params = {}) => {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return request(`/admin/appointments${q ? `?${q}` : ''}`, { token });
  },
  adminSetStatus: (token, id, status) =>
    request(`/admin/appointments/${id}`, { method: 'PATCH', body: { status }, token }),
};
