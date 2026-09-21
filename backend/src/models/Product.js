import prisma from '../database/connection.js';

/** Bo'sh qiymatlarni tozalab, Prisma kutadigan turlarga o'giradi. */
function normalize(data) {
  const out = {};

  if (data.name !== undefined) out.name = String(data.name).trim();
  if (data.nameRu !== undefined) out.nameRu = data.nameRu?.trim() || null;
  if (data.brand !== undefined) out.brand = data.brand?.trim() || null;
  if (data.description !== undefined) out.description = data.description?.trim() || null;
  if (data.descriptionRu !== undefined) out.descriptionRu = data.descriptionRu?.trim() || null;
  if (data.imageUrl !== undefined) out.imageUrl = data.imageUrl?.trim() || null;
  if (data.category !== undefined) out.category = String(data.category).trim() || 'boshqa';
  if (data.volume !== undefined) out.volume = data.volume?.trim() || null;

  if (data.pricePiece !== undefined) out.pricePiece = Math.max(0, Math.round(Number(data.pricePiece) || 0));
  if (data.priceWholesale !== undefined) {
    out.priceWholesale = Math.max(0, Math.round(Number(data.priceWholesale) || 0));
  }
  if (data.minWholesaleQty !== undefined) {
    out.minWholesaleQty = Math.max(1, Math.round(Number(data.minWholesaleQty) || 10));
  }
  if (data.stockQty !== undefined) out.stockQty = Math.max(0, Math.round(Number(data.stockQty) || 0));
  if (data.sortOrder !== undefined) out.sortOrder = Math.round(Number(data.sortOrder) || 0);

  if (data.inStock !== undefined) out.inStock = Boolean(data.inStock);

  if (data.expiryDate !== undefined) {
    out.expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;
  }

  // Optom narx donaga narxdan qimmat bo'lib qolmasligi uchun
  if (out.priceWholesale != null && out.pricePiece != null && out.priceWholesale > out.pricePiece) {
    out.priceWholesale = out.pricePiece;
  }

  return out;
}

export const Product = {
  /** Mijozlar uchun: faqat sotuvdagi mahsulotlar. */
  listForClient({ category, search } = {}) {
    const where = { inStock: true };
    if (category && category !== 'all') where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameRu: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }
    return prisma.product.findMany({ where, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] });
  },

  /** Admin uchun: sotuvda bo'lmaganlari ham ko'rinadi. */
  listForAdmin() {
    return prisma.product.findMany({ orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] });
  },

  findById(id) {
    return prisma.product.findUnique({ where: { id: Number(id) } });
  },

  findManyByIds(ids) {
    return prisma.product.findMany({ where: { id: { in: ids.map(Number) } } });
  },

  create(data) {
    const payload = normalize(data);
    if (!payload.name) throw new Error('Mahsulot nomi kiritilmagan');
    if (payload.pricePiece == null) payload.pricePiece = 0;
    if (payload.priceWholesale == null) payload.priceWholesale = payload.pricePiece;
    if (!payload.category) payload.category = 'boshqa';

    return prisma.product.create({ data: payload });
  },

  update(id, data) {
    return prisma.product.update({ where: { id: Number(id) }, data: normalize(data) });
  },

  remove(id) {
    return prisma.product.delete({ where: { id: Number(id) } });
  },

  count() {
    return prisma.product.count();
  },

  /**
   * Berilgan son uchun narxni hisoblaydi.
   * Soni minWholesaleQty ga yetsa — optom narx qo'llanadi.
   */
  priceFor(product, qty) {
    const isWholesale = qty >= product.minWholesaleQty && product.priceWholesale > 0;
    const unitPrice = isWholesale ? product.priceWholesale : product.pricePiece;
    return { unitPrice, isWholesale, sum: unitPrice * qty };
  },
};

export default Product;
