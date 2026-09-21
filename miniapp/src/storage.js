/**
 * Xavfsiz localStorage.
 *
 * Telegram ichidagi brauzerda (yoki telefon sozlamalarida sayt ma'lumotlari
 * o'chirilgan bo'lsa) localStorage'ga murojaat qilish XATO TASHLAYDI. Eski
 * kodda u to'g'ridan-to'g'ri chaqirilardi — natijada React chizilmay qolib,
 * mijoz OQ EKRAN ko'rardi.
 *
 * Bu yerda hamma narsa try/catch ichida: xotira ishlamasa app baribir
 * ochiladi, faqat sozlamalar eslab qolinmaydi.
 */
export function getItem(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeItem(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* e'tiborsiz */
  }
}
