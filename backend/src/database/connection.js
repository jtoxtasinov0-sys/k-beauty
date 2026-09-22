import { PrismaClient } from '@prisma/client';

/** Butun loyiha bo'ylab bitta Prisma ulanishidan foydalaniladi. */
export const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

/**
 * Yangi jadvallarni bazada yo'q bo'lsa yaratadi.
 *
 * Nega kerak: hosting (Render) faqat `npm install` va `npm start` ni
 * bajaradi — `prisma db push` ishlamaydi. Ya'ni kodga yangi jadval qo'shilsa,
 * bazada u o'zi paydo bo'lmaydi va server "table does not exist" deb
 * yiqiladi. Shu funksiya har ishga tushganda tekshiradi.
 *
 * Buyruqlar IF NOT EXISTS bilan — bor bo'lsa hech narsa qilmaydi va
 * mavjud ma'lumotga tegmaydi.
 */
async function ensureSchema() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS "stories" (
       "id"        SERIAL PRIMARY KEY,
       "title"     TEXT NOT NULL,
       "titleRu"   TEXT,
       "imageUrl"  TEXT NOT NULL,
       "productId" INTEGER,
       "active"    BOOLEAN NOT NULL DEFAULT true,
       "sortOrder" INTEGER NOT NULL DEFAULT 0,
       "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
       "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
     )`,
    `CREATE INDEX IF NOT EXISTS "stories_active_sortOrder_idx"
       ON "stories" ("active", "sortOrder")`,
  ];

  for (const sql of statements) {
    await prisma.$executeRawUnsafe(sql);
  }
}

export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('🗄️  PostgreSQL (Neon) bazasiga ulandi');
  } catch (error) {
    console.error('❌ Bazaga ulanib bo\'lmadi:', error.message);
    console.error('   .env faylidagi DATABASE_URL to\'g\'ri ekanini tekshiring.');
    process.exit(1);
  }

  try {
    await ensureSchema();
  } catch (error) {
    // Jadval yaratilmasa ham qolgan qismi ishlayversin — faqat storylar ishlamaydi.
    console.warn('⚠️  Jadvallarni tekshirib bo‘lmadi:', error.message);
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}

export default prisma;
