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
};

export default User;
