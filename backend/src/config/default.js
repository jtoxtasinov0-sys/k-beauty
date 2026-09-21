import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Loyihaning asosiy sozlamalari — barcha o'zgaruvchilar shu yerdan olinadi. */
export const config = {
  port: Number(process.env.PORT || 4000),
  apiBaseUrl: process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 4000}`,

  bot: {
    token: process.env.BOT_TOKEN || '',
    username: process.env.BOT_USERNAME || '',
    webAppUrl: process.env.WEBAPP_URL || 'http://localhost:5173',
  },

  admin: {
    password: process.env.ADMIN_PASSWORD || 'kbeauty2025',
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
