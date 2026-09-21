import crypto from 'node:crypto';
import { config } from '../config/default.js';
import User from '../models/User.js';

/**
 * Telegram Mini App yuborgan initData'ni HMAC-SHA256 orqali tekshiradi.
 * Hujjat: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function verifyTelegramInitData(initData, botToken) {
  if (!initData) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;

  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (computedHash !== hash) return null;

  try {
    return JSON.parse(params.get('user'));
  } catch {
    return null;
  }
}

/**
 * Mijoz API'si uchun himoya.
 * Telegram ichida — haqiqiy initData tekshiriladi.
 * Localhost'da (ALLOW_INSECURE_AUTH=true) — brauzerdan test qilish uchun soxta foydalanuvchi.
 */
export async function clientAuth(req, res, next) {
  try {
    const initData = req.header('X-Telegram-Init-Data') || '';
    let tgUser = verifyTelegramInitData(initData, config.bot.token);

    if (!tgUser && config.allowInsecureAuth) {
      // Faqat localhost'da test qilish uchun
      tgUser = { id: 999000999, first_name: 'Test', last_name: 'Mijoz', username: 'test_user' };
    }

    if (!tgUser) {
      return res.status(401).json({ error: 'Telegram autentifikatsiyasi amalga oshmadi' });
    }

    req.user = await User.findOrCreateFromTelegram(tgUser);
    next();
  } catch (error) {
    next(error);
  }
}

/** Admin panel API'si uchun oddiy parol himoyasi. */
export function adminAuth(req, res, next) {
  const header = req.header('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.header('X-Admin-Password');

  if (token !== config.admin.password) {
    return res.status(401).json({ error: "Parol noto'g'ri" });
  }

  next();
}

/** Barcha tutilmagan xatolar uchun yagona javob. */
export function errorHandler(err, _req, res, _next) {
  console.error('❌ API xatosi:', err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Serverda xatolik yuz berdi' });
}
