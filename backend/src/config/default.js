import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Mini App'ning DOIMIY manzili (Vercel).
 * Hostingda WEBAPP_URL berilmasa yoki eski vaqtinchalik havola qolib ketgan
 * bo'lsa — bot aynan shu havolaga qaytadi. Sababi: bot hech qachon o'lik
 * havolaga ulanib qolmasligi kerak.
 */
export const PRODUCTION_WEBAPP_URL = 'https://kbeauty-miniapp.vercel.app';

/**
 * Vaqtinchalik tunnel domenlari — ular faqat kompyuter yoqiq va cloudflared/ngrok
 * ishlab turganda ochiladi. Kompyuter o'chsa Telegram "Error 1033" ko'rsatadi.
 */
const TEMPORARY_HOSTS = [
  'trycloudflare.com',
  'ngrok.io',
  'ngrok-free.app',
  'ngrok.app',
  'ngrok-free.dev',
  'loca.lt',
  'serveo.net',
  'localtunnel.me',
  'localhost',
  '127.0.0.1',
];

/** Render yoki boshqa hostingda ishlayaptimi (localhost emasmi)? */
export const isHosted = Boolean(
  process.env.RENDER ||
    process.env.RENDER_EXTERNAL_URL ||
    process.env.NODE_ENV === 'production',
);

/** "https://x.com/" -> "https://x.com" (bo'sh joy va oxirgi "/" olib tashlanadi) */
function normalizeUrl(value) {
  return String(value ?? '').trim().replace(/\/+$/, '');
}

/** Havola vaqtinchalik tunnelga tegishlimi? */
export function isTemporaryHost(url) {
  const lower = String(url ?? '').toLowerCase();
  return TEMPORARY_HOSTS.some((host) => lower.includes(host));
}

/**
 * Mini App havolasini tanlaydi va NEGA shunday tanlanganini ham qaytaradi.
 *
 * Localhost'da: WEBAPP_URL nima bo'lsa o'sha (tunnel bilan ishlash uchun).
 * Hostingda: vaqtinchalik yoki https bo'lmagan havola QABUL QILINMAYDI —
 * uning o'rniga doimiy Vercel havolasi ishlatiladi.
 */
export function resolveWebAppUrl(rawValue = process.env.WEBAPP_URL, hosted = isHosted) {
  const url = normalizeUrl(rawValue);

  if (!hosted) {
    return { url: url || 'http://localhost:5173', source: url ? 'env' : 'default' };
  }

  if (!url) return { url: PRODUCTION_WEBAPP_URL, source: 'fallback-empty' };
  if (!url.startsWith('https://')) return { url: PRODUCTION_WEBAPP_URL, source: 'fallback-not-https' };
  if (isTemporaryHost(url)) return { url: PRODUCTION_WEBAPP_URL, source: 'fallback-temporary' };

  return { url, source: 'env' };
}

const webApp = resolveWebAppUrl();

/**
 * Render'ga nusxalanganda token/username atrofida probel, qo'shtirnoq yoki
 * "@" qolib ketishi mumkin — shunda bot 401/404 bilan ishlamaydi. Tozalaymiz.
 */
function cleanEnv(value) {
  return String(value || '').trim().replace(/^["']+|["']+$/g, '').trim();
}

/** Loyihaning asosiy sozlamalari — barcha o'zgaruvchilar shu yerdan olinadi. */
export const config = {
  port: Number(process.env.PORT || 4000),
  apiBaseUrl: process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 4000}`,
  isHosted,

  bot: {
    token: cleanEnv(process.env.BOT_TOKEN),
    username: cleanEnv(process.env.BOT_USERNAME).replace(/^@/, ''),
    webAppUrl: webApp.url,
    // 'env' — WEBAPP_URL ishlatildi; 'fallback-*' — u yaroqsiz bo'lgani uchun
    // doimiy havolaga o'tildi. /  sahifasida ko'rinadi.
    webAppUrlSource: webApp.source,
    rawWebAppUrl: normalizeUrl(process.env.WEBAPP_URL),
  },

  admin: {
    // Zaxira qiymat ATAYLAB yo'q: kod GitHub'da ochiq turadi, shuning uchun
    // parol faqat .env dan (yoki hosting sozlamalaridan) olinadi.
    // Tekshiruv: src/index.js ichidagi assertAdminPassword().
    password: process.env.ADMIN_PASSWORD || '',
  },

  /**
   * Render'ning bepul tarifi 15 daqiqa tinchlikdan keyin serverni uxlatadi.
   * Server uxlasa — Node jarayoni to'xtaydi va BOT HAM O'CHADI (u polling
   * rejimida ishlaydi, uni uyg'otadigan tashqi so'rov yo'q). Shuning uchun
   * server o'ziga-o'zi vaqti-vaqti bilan so'rov yuborib uyg'oq turadi.
   */
  keepAlive: {
    enabled: String(process.env.KEEP_ALIVE ?? 'true').toLowerCase() !== 'false',
    url: normalizeUrl(process.env.KEEP_ALIVE_URL || process.env.RENDER_EXTERNAL_URL),
    intervalMs: Number(process.env.KEEP_ALIVE_INTERVAL_MS || 13 * 60 * 1000),
  },

  // Localhost'da brauzerdan (Telegramsiz) test qilish uchun
  allowInsecureAuth: String(process.env.ALLOW_INSECURE_AUTH).toLowerCase() === 'true',

  uploadsDir: path.resolve(__dirname, '../../uploads'),
};

/** Mahsulot kategoriyalari — Mini App va Admin Panel shu ro'yxatdan foydalanadi. */
export const CATEGORIES = [
  { key: 'tozalovchi', uz: 'Yuz tozalovchi', ru: 'Очищение', emoji: '🧼' },
  { key: 'krem', uz: 'Kremlar', ru: 'Кремы', emoji: '🧴' },
  { key: 'serum', uz: 'Serum & Ampula', ru: 'Сыворотки', emoji: '💧' },
  { key: 'toner', uz: 'Toner & Mist', ru: 'Тонер и мист', emoji: '🌿' },
  { key: 'bad', uz: 'Vitamin & BAD', ru: 'Витамины и БАД', emoji: '💊' },
  { key: 'boshqa', uz: 'Boshqa', ru: 'Другое', emoji: '✨' },
];

/** Yetkazib berish mintaqalari. */
export const REGIONS = [
  { key: 'KR', uz: 'Koreya ichi', ru: 'По Корее', flag: '🇰🇷' },
  { key: 'UZ', uz: "O'zbekiston", ru: 'Узбекистан', flag: '🇺🇿' },
];

/** Buyurtma holatlari. */
export const ORDER_STATUSES = [
  { key: 'NEW', uz: 'Yangi', ru: 'Новый', color: '#2563eb' },
  { key: 'CONFIRMED', uz: 'Tasdiqlandi', ru: 'Подтверждён', color: '#7c3aed' },
  { key: 'SHIPPED', uz: "Jo'natildi", ru: 'Отправлен', color: '#ea580c' },
  { key: 'DELIVERED', uz: 'Yetkazildi', ru: 'Доставлен', color: '#16a34a' },
  { key: 'CANCELLED', uz: 'Bekor qilindi', ru: 'Отменён', color: '#dc2626' },
];

export default config;
