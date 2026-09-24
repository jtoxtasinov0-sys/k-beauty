import TelegramBot from 'node-telegram-bot-api';
import { config } from '../config/default.js';

if (!config.bot.token) {
  console.error('❌ .env faylida BOT_TOKEN topilmadi.');
  process.exit(1);
}

/** Bitta global bot instansiyasi (long polling rejimida ishlaydi). */
export const bot = new TelegramBot(config.bot.token, {
  polling: {
    interval: 1000,
    autoStart: false,
    params: { timeout: 30 },
  },
});

bot.on('polling_error', (err) => {
  const message = err?.message || String(err);
  if (message.includes('409')) {
    console.warn('⚠️  Bot boshqa joyda ham ishlayapti. Eski jarayonni to\'xtating.');
  } else if (message.includes('401')) {
    console.error('❌ BOT_TOKEN noto\'g\'ri. BotFather\'dan yangi token oling.');
  } else {
    console.warn('⚠️  Polling xatosi:', message);
  }
});

/**
 * Botning Telegram'dagi ko'rinadigan nomi va tavsiflari.
 * '' — standart (o'zbekcha), 'ru' — ruscha interfeysli mijozlar uchun.
 * Nomni o'zgartirmoqchi bo'lsangiz — shu yerni tahrirlab, serverni qayta ishga tushiring.
 */
const BOT_PROFILE = {
  '': {
    name: 'Colibri Cosmetics',
    shortDescription: 'Koreyadan original kosmetika — donaga va optom narxlarda ✨',
    description:
      'Colibri Cosmetics ✨\n\nKoreyadan original kosmetika — donaga va optom narxlarda.\n'
      + 'Koreya ichi va O‘zbekistonga yetkazib berish.\n\n«Start» tugmasini bosing 👇',
  },
  ru: {
    name: 'Colibri Cosmetics',
    shortDescription: 'Оригинальная корейская косметика — поштучно и оптом ✨',
    description:
      'Colibri Cosmetics ✨\n\nОригинальная косметика из Кореи — поштучно и оптом.\n'
      + 'Доставка по Корее и в Узбекистан.\n\nНажмите «Старт» 👇',
  },
};

/**
 * Bot nomi va tavsifini BOT_PROFILE ga moslaydi. Faqat farq bo'lsa yozadi —
 * Telegram setMyName'ni kuniga bir necha marta bilan cheklaydi.
 */
async function syncBotProfile() {
  for (const [lang, profile] of Object.entries(BOT_PROFILE)) {
    const form = lang ? { language_code: lang } : {};
    try {
      const current = await bot.getMyName(form);
      if (current?.name !== profile.name) {
        await bot.setMyName({ ...form, name: profile.name });
        console.log(`🏷  Bot nomi yangilandi (${lang || 'standart'}): ${profile.name}`);
      }

      const short = await bot.getMyShortDescription(form);
      if (short?.short_description !== profile.shortDescription) {
        await bot.setMyShortDescription({ ...form, short_description: profile.shortDescription });
      }

      const full = await bot.getMyDescription(form);
      if (full?.description !== profile.description) {
        await bot.setMyDescription({ ...form, description: profile.description });
      }
    } catch (error) {
      console.warn(`⚠️  Bot profilini yangilab bo'lmadi (${lang || 'standart'}):`, error.message);
    }
  }
}

export async function startBot() {
  const me = await bot.getMe();
  await bot.startPolling();
  console.log(`🤖 Bot ishga tushdi: @${me.username}`);
  syncBotProfile();
  return me;
}

export async function stopBot() {
  try {
    await bot.stopPolling();
  } catch {
    /* jarayon yopilayotganda e'tiborsiz qoldiriladi */
  }
}

export default bot;
