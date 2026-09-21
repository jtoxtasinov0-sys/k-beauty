import bot from '../core/bot.js';
import { config, REGIONS, isTemporaryHost } from '../config/default.js';
import User from '../models/User.js';

/** 8000 -> "8 000 ₩" */
export function formatWon(value) {
  return `${Number(value || 0).toLocaleString('ru-RU')} ₩`;
}

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

/** WebApp tugmasi faqat https havola bilan ishlaydi (ngrok kerak). */
function webAppKeyboard() {
  const url = config.bot.webAppUrl;

  if (!url.startsWith('https://')) {
    return {
      inline_keyboard: [[{ text: '🛍 Do‘konni ochish', url: 'https://t.me/' + config.bot.username }]],
    };
  }

  return {
    inline_keyboard: [[{ text: '🛍 Do‘konni ochish', web_app: { url } }]],
  };
}

const WELCOME = `<b>K-Beauty Store Optom</b> 🇰🇷

Koreyadan original kosmetika — <b>donaga</b> va <b>optom</b> narxlarda.

🧴 ANUA, MEDIPEEL, LACTOFIT, AXIS-Y va boshqa brendlar
📦 Koreya ichi va O‘zbekistonga yetkazib berish
💰 Ko‘p olsangiz — avtomatik optom narx

Pastdagi tugmani bosib katalogni ko‘ring 👇`;

const HELP = `<b>Yordam</b>

/start — do‘konni ochish
/menu — do‘kon tugmasini yangilash
/id — Telegram ID raqamingiz
/help — shu xabar

ℹ️ Agar eski xabardagi tugma ochilmasa (masalan “Error 1033” chiqsa),
/menu yuboring — yangi ishlaydigan tugma keladi.

Savollar bo‘lsa shu yerga yozib qoldiring, operator javob beradi.`;

/** Bot buyruqlari va handlerlarini ro'yxatdan o'tkazadi. */
export function registerBotHandlers() {
  bot.onText(/^\/start/, async (msg) => {
    try {
      await User.findOrCreateFromTelegram(msg.from);
    } catch (error) {
      console.error('User saqlashda xato:', error.message);
    }

    await bot.sendMessage(msg.chat.id, WELCOME, {
      parse_mode: 'HTML',
      reply_markup: webAppKeyboard(),
    });

    if (!config.bot.webAppUrl.startsWith('https://')) {
      await bot.sendMessage(
        msg.chat.id,
        '⚙️ Mini App hali ulanmagan. WEBAPP_URL ga https havola qo‘ying '
          + '(hostingda Render → Environment, kompyuterda backend/.env).',
      );
    }
  });

  // Eski xabardagi tugma o'lik havolaga olib boradi (masalan o'chirilgan
  // tunnelga). /menu har doim YANGI, ishlaydigan tugma yuboradi.
  bot.onText(/^\/(menu|app|dokon|do'kon)/i, async (msg) => {
    const url = config.bot.webAppUrl;

    if (!url.startsWith('https://')) {
      await bot.sendMessage(
        msg.chat.id,
        '⚠️ Do‘kon havolasi hozir sozlanmagan. Operator bilan bog‘laning.',
      );
      return;
    }

    await bot.sendMessage(msg.chat.id, '✅ Do‘kon tayyor — pastdagi tugmani bosing 👇', {
      reply_markup: webAppKeyboard(),
    });
  });

  bot.onText(/^\/help/, (msg) => {
    bot.sendMessage(msg.chat.id, HELP, { parse_mode: 'HTML' });
  });

  bot.onText(/^\/id/, (msg) => {
    bot.sendMessage(msg.chat.id, `Sizning Telegram ID: <code>${msg.from.id}</code>`, {
      parse_mode: 'HTML',
    });
  });

  // Telefon raqam yuborilsa profilga saqlanadi
  bot.on('contact', async (msg) => {
    try {
      const user = await User.findByTelegramId(msg.from.id);
      if (user) {
        await User.update(user.id, { phone: msg.contact.phone_number });
        await bot.sendMessage(msg.chat.id, '✅ Telefon raqamingiz saqlandi.');
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

/** Menu tugmasini (pastdagi "Do'kon" tugmasi) o'rnatadi. */
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
  const region = REGIONS.find((r) => r.key === order.region);
  const items = Array.isArray(order.items) ? order.items : [];

  const lines = items
    .map((item, i) => {
      const badge = item.isWholesale ? ' 🏷 optom' : '';
      return `${i + 1}. ${item.name}\n    ${item.qty} × ${formatWon(item.unitPrice)}${badge} = <b>${formatWon(item.sum)}</b>`;
    })
    .join('\n');

  const text = `✅ <b>Buyurtmangiz muvaffaqiyatli qabul qilindi!</b>
Kuryerimiz tez orada bog‘lanadi 💄

<b>Buyurtma №${order.id}</b>

${lines}

━━━━━━━━━━━━━━
💰 Jami: <b>${formatWon(order.totalWon)}</b>
📍 Manzil: ${region ? region.flag + ' ' + region.uz : order.region} — ${order.address}
📞 Telefon: ${order.phone}

<i>Pochta narxi operator bilan alohida kelishiladi.</i>`;

  try {
    await bot.sendMessage(order.user.telegramId, text, { parse_mode: 'HTML' });
  } catch (error) {
    console.warn('⚠️  Tasdiq xabarini yuborib bo‘lmadi:', error.message);
  }
}

/** Admin buyurtma holatini o'zgartirganda mijozga xabar beradi. */
export async function sendStatusUpdate(order) {
  const messages = {
    CONFIRMED: `👌 Buyurtma №${order.id} tasdiqlandi. Tayyorlashni boshladik!`,
    SHIPPED: `📦 Buyurtma №${order.id} jo‘natildi. Yo‘lda!`,
    DELIVERED: `🎉 Buyurtma №${order.id} yetkazildi. Xaridingiz uchun rahmat!`,
    CANCELLED: `❌ Buyurtma №${order.id} bekor qilindi. Savollar bo‘lsa yozing.`,
  };

  const text = messages[order.status];
  if (!text) return;

  try {
    await bot.sendMessage(order.user.telegramId, text);
  } catch (error) {
    console.warn('⚠️  Holat xabarini yuborib bo‘lmadi:', error.message);
  }
}
