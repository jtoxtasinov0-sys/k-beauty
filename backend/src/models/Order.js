import prisma from '../database/connection.js';

export const Order = {
  create(data) {
    return prisma.order.create({
      data: {
        userId: Number(data.userId),
        items: data.items,
        totalWon: Math.round(data.totalWon),
        region: data.region,
        customerName: data.customerName,
        phone: data.phone,
        address: data.address,
        comment: data.comment || null,
      },
      include: { user: true },
    });
  },

  /** Admin panel uchun barcha buyurtmalar (yangisi tepada). */
  listAll({ status } = {}) {
    const where = {};
    if (status && status !== 'all') where.status = status;

    return prisma.order.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 300,
    });
  },

  listByUser(userId) {
    return prisma.order.findMany({
      where: { userId: Number(userId) },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  },

  findById(id) {
    return prisma.order.findUnique({ where: { id: Number(id) }, include: { user: true } });
  },

  updateStatus(id, status) {
    return prisma.order.update({
      where: { id: Number(id) },
      data: { status },
      include: { user: true },
    });
  },

  remove(id) {
    return prisma.order.delete({ where: { id: Number(id) } });
  },

  /** Admin bosh sahifasidagi qisqa statistika. */
  async stats() {
    const [total, newCount, delivered, sums] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'NEW' } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.aggregate({ _sum: { totalWon: true } }),
    ]);

    return {
      total,
      new: newCount,
      delivered,
      revenueWon: sums._sum.totalWon || 0,
    };
  },
};

export default Order;
