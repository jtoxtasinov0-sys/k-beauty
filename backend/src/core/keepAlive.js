import { config } from '../config/default.js';

let timer = null;

/**
 * Render'ning bepul tarifida server 15 daqiqa tinchlikdan keyin UXLAYDI.
 * Uxlagan server bilan birga Telegram boti ham o'chadi — bot polling rejimida
 * ishlaydi va uni uyg'otadigan tashqi so'rov yo'q. Natijada bot "o'zicha
 * ishlamay qolgandek" ko'rinadi.
 *
 * Yechim: server o'z manziliga har ~13 daqiqada bitta yengil so'rov yuboradi.
 * Render buni "tirik trafik" deb hisoblaydi va serverni uxlatmaydi.
 *
 * O'chirish: KEEP_ALIVE=false (pullik tarifda kerak emas).
 */
export function startKeepAlive() {
  const { enabled, url, intervalMs } = config.keepAlive;

  if (!enabled) {
    console.log('⏰ Keep-alive o‘chirilgan (KEEP_ALIVE=false).');
    return false;
  }

  if (!url) {
    // Localhost'da bu normal holat — u yerda hech narsa uxlamaydi.
    if (config.isHosted) {
      console.warn('⏰ Keep-alive ishlamadi: KEEP_ALIVE_URL topilmadi.');
    }
    return false;
  }

  if (!url.startsWith('https://')) {
    console.warn('⏰ Keep-alive ishlamadi: manzil https emas —', url);
    return false;
  }

  const ping = async () => {
    try {
      const res = await fetch(`${url}/healthz`, {
        headers: { 'User-Agent': 'kbeauty-keepalive' },
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) console.warn('⏰ Keep-alive javobi:', res.status);
    } catch (error) {
      console.warn('⏰ Keep-alive so‘rovi o‘tmadi:', error.message);
    }
  };

  timer = setInterval(ping, intervalMs);
  timer.unref?.(); // server to'xtaganda jarayonni ushlab turmasin

  console.log(`⏰ Keep-alive yoqildi: har ${Math.round(intervalMs / 60000)} daqiqada → ${url}`);
  return true;
}

export function stopKeepAlive() {
  if (timer) clearInterval(timer);
  timer = null;
}

export default startKeepAlive;
