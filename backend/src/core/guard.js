/**
 * Jarayonni kutilmagan tarmoq xatolaridan himoya qiladi.
 *
 * Muammo: Telegram bilan aloqa uzilganda (ECONNRESET va h.k.) Node'da
 * "unhandled 'error' event" chiqadi va BUTUN JARAYON o'ladi — bot ham,
 * API ham, admin panel ham birdaniga ishlamay qoladi. Internet bir soniyaga
 * uzilishi buning uchun yetarli.
 *
 * Yechim: tarmoq xatolarini logga yozamiz va ishlashda davom etamiz
 * (bot polling'ni o'zi qayta tiklaydi). Tarmoqqa aloqasi yo'q haqiqiy
 * dastur xatolarida esa jarayonni to'xtatamiz — hosting uni qaytadan
 * ishga tushiradi va xato yashirinib qolmaydi.
 */

const NETWORK_CODES = new Set([
  'ECONNRESET',
  'ECONNREFUSED',
  'ECONNABORTED',
  'ETIMEDOUT',
  'EPIPE',
  'ENOTFOUND',
  'EAI_AGAIN',
  'ENETUNREACH',
  'ENETDOWN',
  'EHOSTUNREACH',
  'EFATAL',
  'EPARSE',
  'ERR_STREAM_PREMATURE_CLOSE',
  'UND_ERR_SOCKET',
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_HEADERS_TIMEOUT',
]);

const NETWORK_MESSAGES = ['socket hang up', 'network', 'timeout', 'tunneling socket'];

/** Xato tarmoqqa bog'liqmi (ya'ni jarayonni o'ldirishga arzimaydimi)? */
export function isNetworkError(error) {
  if (!error) return false;
  if (NETWORK_CODES.has(error.code)) return true;
  if (error.cause && NETWORK_CODES.has(error.cause.code)) return true;

  const message = String(error.message || error).toLowerCase();
  return NETWORK_MESSAGES.some((part) => message.includes(part));
}

export function installProcessGuards() {
  process.on('unhandledRejection', (reason) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    console.warn('⚠️  Ushlanmagan promise xatosi:', error.message);
  });

  process.on('uncaughtException', (error) => {
    if (isNetworkError(error)) {
      console.warn('⚠️  Tarmoq xatosi (ishlash davom etadi):', error.code || error.message);
      return;
    }

    console.error('❌ Jiddiy xato — jarayon to‘xtatilmoqda:', error);
    process.exit(1);
  });

  console.log('🛡️  Himoya yoqildi: tarmoq uzilishi endi serverni o‘ldirmaydi');
}

export default installProcessGuards;
