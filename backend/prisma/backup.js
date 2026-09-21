import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(__dirname, 'backup-products.json');

/** Bazadagi barcha mahsulotlarni faylga yozadi. */
async function backup() {
  const products = await prisma.product.findMany({ orderBy: { sortOrder: 'asc' } });

  const data = products.map(({ id, createdAt, updatedAt, ...rest }) => rest);
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8');

  console.log(`💾 ${data.length} ta mahsulot zaxiraga olindi:`);
  console.log(`   ${FILE}`);
}

/** Zaxiradagi mahsulotlarni bazaga qaytaradi (bazada yo'qlarini qo'shadi). */
async function restore() {
  if (!fs.existsSync(FILE)) {
    console.error('❌ Zaxira fayli topilmadi. Avval: npm run db:backup');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const existing = await prisma.product.findMany({ select: { name: true } });
  const have = new Set(existing.map((p) => p.name.toLowerCase()));

  let added = 0;
  for (const item of data) {
    if (have.has(item.name.toLowerCase())) continue;
    await prisma.product.create({
      data: { ...item, expiryDate: item.expiryDate ? new Date(item.expiryDate) : null },
    });
    console.log(`  ✅ ${item.name}`);
    added++;
  }

  console.log(
    added
      ? `\n♻️  ${added} ta mahsulot tiklandi.`
      : '\n✅ Hammasi joyida — tiklanadigan mahsulot yo\'q.',
  );
}

const run = process.argv.includes('--restore') ? restore : backup;

run()
  .catch((e) => {
    console.error('❌ Xato:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
