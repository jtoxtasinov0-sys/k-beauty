import express from 'express';
import cors from 'cors';
import { config } from './config/default.js';
import { connectDatabase, disconnectDatabase } from './database/connection.js';
import { startBot, stopBot } from './core/bot.js';
import { errorHandler } from './middlewares/auth.middleware.js';
import registerBotRoutes from './routes/bot.routes.js';
import clientRoutes from './routes/client.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Yuklangan rasmlar: http://localhost:4000/uploads/xxx.webp
app.use('/uploads', express.static(config.uploadsDir, { maxAge: '7d' }));

app.get('/', (_req, res) => {
  res.json({ name: 'K-Beauty Store Optom API', status: 'ishlayapti' });
});

app.use('/api/client', clientRoutes);
app.use('/api/admin', adminRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Yo\'l topilmadi' }));
app.use(errorHandler);

async function bootstrap() {
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

  const shutdown = async () => {
    console.log('\n👋 To\'xtatilmoqda...');
    await stopBot();
    server.close();
    await disconnectDatabase();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap();
