import { initData } from './telegram.js';
import { API_BASE } from './config.js';

const BASE = API_BASE;

/**
 * Render'ning bepul serveri 15 daqiqa ishlatilmasa uxlab qoladi va birinchi
 * so'rovda ~1 daqiqagacha uyg'onadi. Shuning uchun: oddiy so'rov uchun qisqa
 * kutish, u o'tmasa — uzoq kutish bilan bitta qayta urinish.
 */
const NORMAL_TIMEOUT_MS = 15_000;
const COLD_START_TIMEOUT_MS = 75_000;

function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer),
  );
}

async function request(path, options = {}) {
  const url = `${BASE}/api/client${path}`;
  const method = options.method || 'GET';

  const init = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': initData,
      ...(options.headers || {}),
    },
  };

  let res;
  try {
    res = await fetchWithTimeout(url, init, NORMAL_TIMEOUT_MS);
  } catch (error) {
    // Faqat o'qish so'rovlarini qaytadan urinamiz. Buyurtma (POST/PATCH) ni
    // takrorlash mumkin emas — server uni allaqachon qabul qilgan bo'lishi mumkin.
    if (method !== 'GET') {
      throw new Error("Server javob bermadi. Internetni tekshirib qaytadan urinib ko'ring.");
    }
    res = await fetchWithTimeout(url, init, COLD_START_TIMEOUT_MS);
  }

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
  stories: () => request('/stories'),
  myOrders: () => request('/orders'),
  createOrder: (body) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),
};

/**
 * Birinchi so'rovlarni React chizilishini kutmasdan, sahifa ochilishi bilanoq
 * boshlaymiz. Shu bilan bir vaqtda uxlab yotgan server ham uyg'ona boshlaydi.
 * Natija: ma'lumot ~1 soniyaga erta keladi.
 */
export const prefetch = {
  me: api.me().catch((error) => ({ __error: error })),
  products: api.products().catch((error) => ({ __error: error })),
  stories: api.stories().catch((error) => ({ __error: error })),
};

/** /uploads/... ni to'liq havolaga aylantiradi. */
export function imageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BASE}${url}`;
}
