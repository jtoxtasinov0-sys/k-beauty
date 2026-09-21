/** Telegram WebApp SDK bilan ishlash uchun kichik yordamchi. */
export const tg = window.Telegram?.WebApp;

export function initTelegram() {
  if (!tg) return null;

  tg.ready();
  tg.expand();

  try {
    tg.setHeaderColor('#ffffff');
    tg.setBackgroundColor('#ffffff');
    tg.disableVerticalSwipes?.();
  } catch {
    /* eski Telegram versiyalarida bu metodlar yo'q */
  }

  return tg.initDataUnsafe?.user || null;
}

export const initData = tg?.initData || '';

export function haptic(style = 'light') {
  try {
    tg?.HapticFeedback?.impactOccurred(style);
  } catch {
    /* qo'llab-quvvatlanmasa e'tiborsiz */
  }
}

export function notifySuccess() {
  try {
    tg?.HapticFeedback?.notificationOccurred('success');
  } catch {
    /* qo'llab-quvvatlanmasa e'tiborsiz */
  }
}

export function closeApp() {
  tg?.close();
}
