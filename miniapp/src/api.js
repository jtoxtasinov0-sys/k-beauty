import { initData } from './telegram.js';

const BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}/api/client${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': initData,
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Server bilan aloqa yo\'q');
  return data;
}

export const api = {
  me: () => request('/me'),
  saveProfile: (body) => request('/me', { method: 'PATCH', body: JSON.stringify(body) }),
  products: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v != null),
    ).toString();
    return request(`/products${qs ? `?${qs}` : ''}`);
  },
  myOrders: () => request('/orders'),
  createOrder: (body) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),
};

/** /uploads/... ni to'liq havolaga aylantiradi. */
export function imageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BASE}${url}`;
}
