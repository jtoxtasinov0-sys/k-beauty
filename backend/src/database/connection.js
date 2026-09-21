import { PrismaClient } from '@prisma/client';

/** Butun loyiha bo'ylab bitta Prisma ulanishidan foydalaniladi. */
export const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('🗄️  PostgreSQL (Neon) bazasiga ulandi');
  } catch (error) {
    console.error('❌ Bazaga ulanib bo\'lmadi:', error.message);
    console.error('   .env faylidagi DATABASE_URL to\'g\'ri ekanini tekshiring.');
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}

export default prisma;
