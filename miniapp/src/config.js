/**
 * Backend (API) manzili.
 *
 * Odatda Vercel'dagi VITE_API_URL o'zgaruvchisidan olinadi. Lekin u
 * qo'yilmagan yoki Redeploy qilinmagan bo'lsa — sayt ochiladi-yu, mahsulotlar
 * kelmaydi ("Server bilan aloqa yo'q"). Shunday bo'lib qolmasligi uchun
 * doimiy manzil zaxira sifatida shu yerda turadi.
 */
const PRODUCTION_API_URL = 'https://k-beauty-0rv9.onrender.com';

function resolveApiBase() {
  const fromEnv = String(import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
  if (fromEnv) return fromEnv;

  // Localhost'da Vite proxy'si /api va /uploads ni o'zi uzatadi — bo'sh qolsin.
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  if (host === 'localhost' || host === '127.0.0.1') return '';

  return PRODUCTION_API_URL;
}

export const API_BASE = resolveApiBase();

export default API_BASE;
