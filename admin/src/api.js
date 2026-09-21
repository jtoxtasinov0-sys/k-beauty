import { API_BASE } from './config.js';

const BASE = API_BASE;
const TOKEN_KEY = 'kbeauty_admin_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}/api/admin${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Xatolik yuz berdi');
  return data;
}

export const api = {
  login: (password) =>
    request('/login', { method: 'POST', body: JSON.stringify({ password }) }),

  meta: () => request('/meta'),
  stats: () => request('/stats'),

  orders: (status) => request(`/orders${status && status !== 'all' ? `?status=${status}` : ''}`),
  setOrderStatus: (id, status) =>
    request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteOrder: (id) => request(`/orders/${id}`, { method: 'DELETE' }),

  products: () => request('/products'),
  createProduct: (body) => request('/products', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id, body) =>
    request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  async upload(file) {
    const form = new FormData();
    form.append('image', file);

    const res = await fetch(`${BASE}/api/admin/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: form,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Rasm yuklanmadi');
    return data;
  },
};

export function imageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BASE}${url}`;
}

export function won(value) {
  return `${Number(value || 0).toLocaleString('ru-RU')} ₩`;
}
