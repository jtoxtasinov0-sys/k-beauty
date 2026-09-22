import prisma from '../database/connection.js';

/** Admin paneldan kelgan ma'lumotni tozalab, bazaga mos ko'rinishga keltiradi. */
function normalize(data) {
  const out = {};

  if (data.title !== undefined) out.title = String(data.title).trim();
  if (data.titleRu !== undefined) out.titleRu = data.titleRu?.trim() || null;
  if (data.imageUrl !== undefined) out.imageUrl = String(data.imageUrl).trim();

  if (data.productId !== undefined) {
    const id = Number(data.productId);
    out.productId = Number.isFinite(id) && id > 0 ? Math.round(id) : null;
  }

  if (data.active !== undefined) out.active = Boolean(data.active);
  if (data.sortOrder !== undefined) out.sortOrder = Math.round(Number(data.sortOrder) || 0);

  return out;
}

export const Story = {
  /** Mijozga ko'rinadigan storylar — faqat faollari, tartib bo'yicha. */
  listActive() {
    return prisma.story.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: 'asc' }, { id: 'desc' }],
      take: 20,
    });
  },

  /** Admin panel uchun — faoli ham, faolsizi ham. */
  listAll() {
    return prisma.story.findMany({
      orderBy: [{ sortOrder: 'asc' }, { id: 'desc' }],
    });
  },

  create(data) {
    const payload = normalize(data);
    if (!payload.title) throw new Error('Story sarlavhasi kiritilmagan');
    if (!payload.imageUrl) throw new Error('Story uchun rasm tanlanmagan');

    return prisma.story.create({ data: payload });
  },

  update(id, data) {
    return prisma.story.update({ where: { id: Number(id) }, data: normalize(data) });
  },

  remove(id) {
    return prisma.story.delete({ where: { id: Number(id) } });
  },
};

export default Story;
