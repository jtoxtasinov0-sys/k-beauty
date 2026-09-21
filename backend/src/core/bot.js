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

export async function startBot() {
  const me = await bot.getMe();
  await bot.startPolling();
  console.log(`🤖 Bot ishga tushdi: @${me.username}`);
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
