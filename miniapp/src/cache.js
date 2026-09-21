/**
 * Oxirgi ko'rilgan ma'lumotlarni telefon xotirasida saqlaydi.
 *
 * Nega kerak: app har ochilganda serverdan javob kutib bo'sh ekran turardi.
 * Endi avval saqlangan mahsulotlar DARHOL chiziladi, yangisi esa orqa fonda
 * kelib ustiga yozadi. Shuning uchun app bir zumda ochilgandek ko'rinadi.
 */
import { getItem, setItem } from './storage.js';

const PREFIX = 'kbeauty_cache_';
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 1 kun

export function readCache(key, maxAgeMs = MAX_AGE_MS) {
  try {
    const raw = getItem(PREFIX + key);
    if (!raw) return null;

    const { at, value } = JSON.parse(raw);
    if (!at || Date.now() - at > maxAgeMs) return null;

    return value;
  } catch {
    return null; // xotira band yoki ma'lumot buzilgan — e'tiborsiz qoldiramiz
  }
}

export function writeCache(key, value) {
  try {
    setItem(PREFIX + key, JSON.stringify({ at: Date.now(), value }));
  } catch {
    /* xotirada joy yo'q — app baribir ishlayveradi */
  }
}
