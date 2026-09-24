import express from 'express';
import cors from 'cors';
import { config } from './config/default.js';
import { connectDatabase, disconnectDatabase } from './database/connection.js';
import { startBot, stopBot } from './core/bot.js';
import { startKeepAlive, stopKeepAlive } from './core/keepAlive.js';
import { installProcessGuards } from './core/guard.js';
import { errorHandler } from './middlewares/auth.middleware.js';
import registerBotRoutes from './routes/bot.routes.js';
import { getBotStatus } from './controllers/botController.js';
import clientRoutes from './routes/client.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Yuklangan rasmlar: http://localhost:4000/uploads/xxx.webp
app.use('/uploads', express.static(config.uploadsDir, { maxAge: '7d' }));

// Keep-alive va Render Health Check uchun eng yengil javob.
app.get('/healthz', (_req, res) => res.json({ ok: true }));

// Brauzerdan ochib tekshirish uchun: bot ishlayaptimi va Mini App havolasi to'g'rimi.
app.get('/', (_req, res) => {
  res.json({
    name: 'Colibri Cosmetics API',
    status: 'ishlayapti',
    uptimeSeconds: Math.round(process.uptime()),
    bot: getBotStatus(),
  });
});

app.use('/api/client', clientRoutes);
app.use('/api/admin', adminRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Yo\'l topilmadi' }));
app.use(errorHandler);

/**
 * Admin paroli yo'q bo'lsa serverni ishga tushirmaydi.
 * Sabab: parol bir vaqtda token sifatida ham ishlatiladi — bo'sh qolsa
 * bo'sh parol bilan admin panelga kirib bo'lardi.
 */
function assertAdminPassword() {
  const password = config.admin.password;

  if (!password) {
    console.error("❌ ADMIN_PASSWORD berilmagan — server ishga tushmaydi.");
    console.error('   Localhost uchun: backend/.env fayliga ADMIN_PASSWORD="..." qo\'shing.');
    console.error('   Render/hosting uchun: Environment Variables bo\'limiga qo\'shing.');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('❌ ADMIN_PASSWORD juda qisqa — kamida 8 ta belgi bo\'lsin.');
    process.exit(1);
  }

  if (password === 'kbeauty2025') {
    console.warn('⚠️  ADMIN_PASSWORD eski ochiq parolga teng — uni almashtiring!');
  }
}

/**
 * WEBAPP_URL eskirib qolgan bo'lsa logda aniq yozib qo'yadi.
 * Eng ko'p uchraydigan holat: kompyuterdagi cloudflared havolasi hostingga
 * ko'chirilgan, keyin kompyuter o'chirilgan va havola o'lgan.
 */
function reportWebAppUrl() {
  const { webAppUrl, webAppUrlSource, rawWebAppUrl } = config.bot;

  if (webAppUrlSource === 'fallback-temporary') {
    console.warn('⚠️  WEBAPP_URL vaqtinchalik tunnel havolasi edi:', rawWebAppUrl);
    console.warn('   U kompyuter o‘chganda o‘ladi, shuning uchun ishlatilmadi.');
    console.warn('   Buning o‘rniga doimiy havola olindi:', webAppUrl);
    console.warn('   Render → Environment → WEBAPP_URL ni shu qiymatga o‘zgartiring.');
  } else if (webAppUrlSource === 'fallback-empty') {
    console.warn('⚠️  WEBAPP_URL berilmagan — doimiy havola olindi:', webAppUrl);
  } else if (webAppUrlSource === 'fallback-not-https') {
    console.warn('⚠️  WEBAPP_URL https emas:', rawWebAppUrl, '— doimiy havola olindi:', webAppUrl);
  } else {
    console.log('🔗 Mini App havolasi:', webAppUrl);
  }
}

async function bootstrap() {
  installProcessGuards();
  assertAdminPassword();
  reportWebAppUrl();
  await connectDatabase();

  const server = app.listen(config.port, () => {
    console.log(`🚀 API tayyor: http://localhost:${config.port}`);
  });

  try {
    await startBot();
    await registerBotRoutes();
  } catch (error) {
    console.error('❌ Botni ishga tushirib bo\'lmadi:', error.message);
  }

  // Bepul tarifda server uxlab qolmasligi uchun (u bilan birga bot ham o'chadi)
  startKeepAlive();

  const shutdown = async () => {
    console.log('\n👋 To\'xtatilmoqda...');
    stopKeepAlive();
    await stopBot();
    server.close();
    await disconnectDatabase();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap();
