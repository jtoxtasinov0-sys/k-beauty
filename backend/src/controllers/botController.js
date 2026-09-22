import bot from '../core/bot.js';
import { config, REGIONS, isTemporaryHost } from '../config/default.js';
import {
  texts,
  normalizeLang,
  formatWon,
  ASK_LANGUAGE,
  LANGUAGE_KEYBOARD,
} from '../config/botText.js';
import User from '../models/User.js';

export { formatWon };

/** Menu tugmasining oxirgi holati — `/` sahifasida ko'rsatiladi. */
const menuButtonState = { status: 'kutilmoqda', url: null, checkedAt: null, error: null };

/** Bot va Mini App havolasining joriy holati (maxfiy ma'lumotsiz). */
export function getBotStatus() {
  return {
    username: config.bot.username || null,
    polling: bot.isPolling(),
    webAppUrl: config.bot.webAppUrl,
    webAppUrlSource: config.bot.webAppUrlSource,
    menuButton: { ...menuButtonState },
  };
}

/** Mijozning saqlangan tili (topilmasa — o'zbekcha). */
async function langOf(telegramId) {
  try {
    const user = await User.findByTelegramId(telegramId);
    return normalizeLang(user?.language);
  } catch {
    return 'uz';
  }
}

/** WebApp tugmasi faqat https havola bilan ishlaydi (tunnel yoki hosting kerak). */
function webAppKeyboard(lang) {
  const url = config.bot.webAppUrl;
  const t = texts(lang);

  if (!url.startsWith('https://')) {
    return {
      inline_keyboard: [[{ text: t.openShop, url: 'https://t.me/' + config.bot.username }]],
    };
  }

  return {
    inline_keyboard: [[{ text: t.openShop, web_app: { url } }]],
  };
}

/** Til tanlash tugmalarini yuboradi. */
function askLanguage(chatId) {
  return bot.sendMessage(chatId, ASK_LANGUAGE, { reply_markup: LANGUAGE_KEYBOARD });
}

/** Salomlashuv xabari — mijozning tilida. */
async function sendWelcome(chatId, lang) {
  const t = texts(lang);

  await bot.sendMessage(chatId, t.welcome, {
    parse_mode: 'HTML',
    reply_markup: webAppKeyboard(lang),
  });

  if (!config.bot.webAppUrl.startsWith('https://')) {
    await bot.sendMessage(chatId, t.notConnected);
  }
}

/** Bot buyruqlari va handlerlarini ro'yxatdan o'tkazadi. */
export function registerBotHandlers() {
  bot.onText(/^\/start/, async (msg) => {
    let user = null;
    let isNew = false;
    let dbOk = true;

    try {
      // Avval qarab olamiz: bu odam bizda bormi? Shu orqali "yangi mijoz"ni
      // bazaga qo'shimcha ustun qo'shmasdan aniqlaymiz.
      const existing = await User.findByTelegramId(msg.from.id);
      isNew = !existing;
      user = await User.findOrCreateFromTelegram(msg.from);
    } catch (error) {
      dbOk = false;
      console.error('User saqlashda xato:', error.message);
    }

    // Yangi mijozdan birinchi navbatda tilni so'raymiz.
    if (dbOk && isNew) {
      await askLanguage(msg.chat.id);
      return;
    }

    await sendWelcome(msg.chat.id, user?.language);
  });

  // Tilni istalgan payt o'zgartirish
  bot.onText(/^\/(til|til'|lang|language|yazyk)/i, async (msg) => {
    await askLanguage(msg.chat.id);
  });

  // Til tanlanganda
  bot.on('callback_query', async (query) => {
    const data = query.data || '';
    if (!data.startsWith('lang:')) return;

    const lang = normalizeLang(data.slice('lang:'.length));
    const t = texts(lang);
    const chatId = query.message?.chat?.id;

    try {
      const user = await User.findOrCreateFromTelegram(query.from);
      await User.update(user.id, { language: lang });
    } catch (error) {
      console.error('Tilni saqlashda xato:', error.message);
    }

    try {
      await bot.answerCallbackQuery(query.id, { text: t.langSaved });
    } catch {
      /* tugma eskirgan bo'lsa e'tiborsiz */
    }

    if (!chatId) return;

    // Tugmalarni olib tashlaymiz — ikki marta bosilmasin
    try {
      await bot.editMessageText(t.langSaved, {
        chat_id: chatId,
        message_id: query.message.message_id,
      });
    } catch {
      /* xabarni tahrirlab bo'lmasa ham davom etamiz */
    }

    await sendWelcome(chatId, lang);
  });

  // Eski xabardagi tugma o'lik havolaga olib boradi (masalan o'chirilgan
  // tunnelga). /menu har doim YANGI, ishlaydigan tugma yuboradi.
  bot.onText(/^\/(menu|app|dokon|do'kon|magazin)/i, async (msg) => {
    const lang = await langOf(msg.from.id);
    const t = texts(lang);

    if (!config.bot.webAppUrl.startsWith('https://')) {
      await bot.sendMessage(msg.chat.id, t.shopNotReady);
      return;
    }

    await bot.sendMessage(msg.chat.id, t.shopReady, { reply_markup: webAppKeyboard(lang) });
  });

  bot.onText(/^\/help/, async (msg) => {
    const t = texts(await langOf(msg.from.id));
    bot.sendMessage(msg.chat.id, t.help, { parse_mode: 'HTML' });
  });

  bot.onText(/^\/id/, async (msg) => {
    const t = texts(await langOf(msg.from.id));
    bot.sendMessage(msg.chat.id, t.yourId(msg.from.id), { parse_mode: 'HTML' });
  });

  // Telefon raqam yuborilsa profilga saqlanadi
  bot.on('contact', async (msg) => {
    try {
      const user = await User.findByTelegramId(msg.from.id);
      if (user) {
        await User.update(user.id, { phone: msg.contact.phone_number });
        await bot.sendMessage(msg.chat.id, texts(user.language).phoneSaved);
      }
    } catch (error) {
      console.error('Kontakt saqlashda xato:', error.message);
    }
  });

  console.log('📋 Bot handlerlari ulandi');
}

/** Telegram'da hozir o'rnatilgan menu tugmasini o'qiydi (xato bo'lsa null). */
async function readMenuButton() {
  try {
    return await bot.getChatMenuButton();
  } catch (error) {
    console.warn('⚠️  Menu tugmasini o‘qib bo‘lmadi:', error.message);
    return null;
  }
}

/**
 * O'lik tunnel havolasini menu tugmasidan olib tashlaydi.
 *
 * Nega kerak: kompyuterda cloudflared bilan ishlaganda menu tugmasiga
 * vaqtinchalik havola yoziladi. Kompyuter o'chgach o'sha havola o'ladi, lekin
 * tugma Telegram serverida QOLIB KETADI — mijoz bosganda "Error 1033" chiqadi.
 * Shuning uchun yaroqli havola bo'lmasa, tugmani butunlay olib tashlaymiz.
 */
async function clearStaleMenuButton() {
  const current = await readMenuButton();
  const currentUrl = current?.web_app?.url;

  if (!currentUrl || !isTemporaryHost(currentUrl)) {
    menuButtonState.status = 'o‘rnatilmadi';
    menuButtonState.url = currentUrl || null;
    menuButtonState.checkedAt = new Date().toISOString();
    return;
  }

  try {
    await bot.setChatMenuButton({ menu_button: JSON.stringify({ type: 'default' }) });
    menuButtonState.status = 'eski-havola-olib-tashlandi';
    menuButtonState.url = null;
    menuButtonState.checkedAt = new Date().toISOString();
    console.warn('🧹 Menu tugmasidagi o‘lik tunnel havolasi olib tashlandi:', currentUrl);
  } catch (error) {
    menuButtonState.status = 'xato';
    menuButtonState.error = error.message;
    console.warn('⚠️  Eski menu tugmasini olib tashlab bo‘lmadi:', error.message);
  }
}

/**
 * Menu tugmasini (pastdagi "Do'kon" tugmasi) o'rnatadi.
 *
 * Diqqat: tugma ATAYLAB hamma uchun bitta qilib qo'yilgan (chat_id berilmaydi).
 * Har bir mijozga alohida tugma qo'yilsa, keyinchalik havola o'zgarganda
 * umumiy tuzatish ularga yetib bormaydi va yana o'lik havola qolib ketadi.
 * Shuning uchun tugma matni tarjima qilinmaydi — xabarlardagi tugmalar esa
 * mijozning tilida bo'ladi.
 */
export async function setupMenuButton() {
  const url = config.bot.webAppUrl;

  if (!url.startsWith('https://')) {
    console.warn('⚠️  WEBAPP_URL https emas — menu tugmasi o‘rnatilmadi (tunnel kerak).');
    await clearStaleMenuButton();
    return;
  }

  try {
    await bot.setChatMenuButton({
      menu_button: JSON.stringify({ type: 'web_app', text: 'Do‘kon', web_app: { url } }),
    });

    // Telegram rostdan ham qabul qilganini tekshiramiz — "o'rnatildi" deb
    // yozib, aslida eski havola qolib ketmasligi uchun.
    const saved = await readMenuButton();
    const savedUrl = saved?.web_app?.url || null;

    menuButtonState.url = savedUrl;
    menuButtonState.checkedAt = new Date().toISOString();
    menuButtonState.error = null;

    if (savedUrl === url) {
      menuButtonState.status = 'o‘rnatildi';
      console.log('📱 Menu tugmasi o‘rnatildi:', url);
    } else {
      menuButtonState.status = 'tasdiqlanmadi';
      console.warn('⚠️  Menu tugmasi tasdiqlanmadi. Telegram’dagi havola:', savedUrl);
    }
  } catch (error) {
    menuButtonState.status = 'xato';
    menuButtonState.error = error.message;
    menuButtonState.checkedAt = new Date().toISOString();
    console.warn('⚠️  Menu tugmasini o‘rnatib bo‘lmadi:', error.message);
  }
}

/** Buyurtma bazaga tushgach mijozga yuboriladigan tasdiq xabari. */
export async function sendOrderConfirmation(order) {
  const lang = normalizeLang(order.user?.language);
  const t = texts(lang);

  const region = REGIONS.find((r) => r.key === order.region);
  const regionName = region ? `${region.flag} ${lang === 'ru' ? region.ru : region.uz}` : order.region;
  const items = Array.isArray(order.items) ? order.items : [];

  const lines = items
    .map((item, i) => {
      const badge = item.isWholesale ? t.wholesaleBadge : '';
      return `${i + 1}. ${item.name}\n    ${item.qty} × ${formatWon(item.unitPrice)}${badge} = <b>${formatWon(item.sum)}</b>`;
    })
    .join('\n');

  const text = `${t.orderTitle}

${t.orderNo(order.id)}

${lines}

━━━━━━━━━━━━━━
💰 ${t.orderTotal}: <b>${formatWon(order.totalWon)}</b>
📍 ${t.orderAddress}: ${regionName} — ${order.address}
📞 ${t.orderPhone}: ${order.phone}

${t.orderNote}`;

  try {
    await bot.sendMessage(order.user.telegramId, text, { parse_mode: 'HTML' });
  } catch (error) {
    console.warn('⚠️  Tasdiq xabarini yuborib bo‘lmadi:', error.message);
  }
}

/** Admin buyurtma holatini o'zgartirganda mijozga xabar beradi. */
export async function sendStatusUpdate(order) {
  const t = texts(order.user?.language);
  const build = t.status[order.status];
  if (!build) return;

  try {
    await bot.sendMessage(order.user.telegramId, build(order.id));
  } catch (error) {
    console.warn('⚠️  Holat xabarini yuborib bo‘lmadi:', error.message);
  }
}
