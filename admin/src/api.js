import { API_BASE } from './config.js';

const BASE = API_BASE;
const TOKEN_KEY = 'kbeauty_admin_token';

// Brauzer xotirasi bloklangan bo'lsa localStorage XATO TASHLAYDI va panel
// umuman ochilmay qoladi. Shuning uchun har bir murojaat himoyalangan.
export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* xotira ishlamasa parol faqat shu sessiyada saqlanadi */
  }
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

  stories: () => request('/stories'),
  createStory: (body) => request('/stories', { method: 'POST', body: JSON.stringify(body) }),
  updateStory: (id, body) =>
    request(`/stories/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteStory: (id) => request(`/stories/${id}`, { method: 'DELETE' }),

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
