import prisma from '../database/connection.js';

export const User = {
  /** Telegram ma'lumotlari asosida mijozni topadi yoki yangisini yaratadi. */
  async findOrCreateFromTelegram(tgUser) {
    const telegramId = String(tgUser.id);

    return prisma.user.upsert({
      where: { telegramId },
      update: {
        firstName: tgUser.first_name || 'Mijoz',
        lastName: tgUser.last_name || null,
        username: tgUser.username || null,
      },
      create: {
        telegramId,
        firstName: tgUser.first_name || 'Mijoz',
        lastName: tgUser.last_name || null,
        username: tgUser.username || null,
        language: tgUser.language_code === 'ru' ? 'ru' : 'uz',
      },
    });
  },

  findByTelegramId(telegramId) {
    return prisma.user.findUnique({ where: { telegramId: String(telegramId) } });
  },

  findById(id) {
    return prisma.user.findUnique({ where: { id: Number(id) } });
  },

  /** Profilni yangilaydi (telefon, til). */
  update(id, data) {
    const payload = {};
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.language !== undefined) payload.language = data.language === 'ru' ? 'ru' : 'uz';

    return prisma.user.update({ where: { id: Number(id) }, data: payload });
  },

  count() {
    return prisma.user.count();
  },

  /**
   * Admin panel uchun mijozlar ro'yxati: Telegram profili, telefoni va
   * buyurtmalar bo'yicha qisqacha hisob.
   *
   * updatedAt — "oxirgi faollik": mijoz Mini App'ni har ochganda profili
   * qayta yoziladi, shuning uchun bu maydon oxirgi kirgan vaqtni ko'rsatadi.
   */
  async listForAdmin() {
    const users = await prisma.user.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 500,
      include: {
        orders: {
          select: { id: true, totalWon: true, status: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return users.map((user) => {
      // Bekor qilingan buyurtmalar umumiy summaga qo'shilmaydi
      const counted = user.orders.filter((o) => o.status !== 'CANCELLED');

      return {
        id: user.id,
        telegramId: user.telegramId,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        phone: user.phone,
        language: user.language,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        orderCount: user.orders.length,
        totalWon: counted.reduce((sum, o) => sum + o.totalWon, 0),
        lastOrderAt: user.orders[0]?.createdAt || null,
        orders: user.orders,
      };
    });
  },
};

export default User;
