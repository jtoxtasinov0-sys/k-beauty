import { CATEGORIES, REGIONS } from '../config/default.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { sendOrderConfirmation } from './botController.js';

/** Mini App ochilganda: mijoz ma'lumoti + kategoriyalar + mintaqalar. */
export async function getMe(req, res, next) {
  try {
    res.json({
      user: req.user,
      categories: CATEGORIES,
      regions: REGIONS,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProducts(req, res, next) {
  try {
    const products = await Product.listForClient({
      category: req.query.category,
      search: req.query.search,
    });
    res.json({ products });
  } catch (error) {
    next(error);
  }
}

export async function getProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.inStock) {
      return res.status(404).json({ error: 'Mahsulot topilmadi' });
    }
    res.json({ product });
  } catch (error) {
    next(error);
  }
}

/** Profilni yangilash (telefon raqam, til). */
export async function updateProfile(req, res, next) {
  try {
    const user = await User.update(req.user.id, {
      phone: req.body.phone,
      language: req.body.language,
    });
    res.json({ user });
  } catch (error) {
    next(error);
  }
}

export async function getMyOrders(req, res, next) {
  try {
    const orders = await Order.listByUser(req.user.id);
    res.json({ orders });
  } catch (error) {
    next(error);
  }
}

/**
 * Buyurtmani qabul qilish.
 * Narxlar mijozdan emas, BAZADAN olinadi — soxta summalar yuborilishining oldi olinadi.
 */
export async function createOrder(req, res, next) {
  try {
    const { items = [], region, customerName, phone, address, comment } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Savatcha bo'sh" });
    }
    if (!REGIONS.some((r) => r.key === region)) {
      return res.status(400).json({ error: 'Yetkazib berish mintaqasi tanlanmagan' });
    }
    if (!customerName?.trim()) return res.status(400).json({ error: 'Ismingizni kiriting' });
    if (!phone?.trim()) return res.status(400).json({ error: 'Telefon raqamingizni kiriting' });
    if (!address?.trim()) return res.status(400).json({ error: 'Manzilni kiriting' });

    const ids = items.map((i) => Number(i.productId)).filter(Boolean);
    const products = await Product.findManyByIds(ids);
    const byId = new Map(products.map((p) => [p.id, p]));

    const orderItems = [];
    let totalWon = 0;

    for (const item of items) {
      const product = byId.get(Number(item.productId));
      if (!product || !product.inStock) continue;

      const qty = Math.max(1, Math.round(Number(item.qty) || 1));
      const { unitPrice, isWholesale, sum } = Product.priceFor(product, qty);

      orderItems.push({
        productId: product.id,
        name: product.name,
        brand: product.brand,
        imageUrl: product.imageUrl,
        qty,
        unitPrice,
        isWholesale,
        sum,
      });
      totalWon += sum;
    }

    if (orderItems.length === 0) {
      return res.status(400).json({ error: 'Tanlangan mahsulotlar sotuvda yo\'q' });
    }

    // Telefon raqamni profilga ham saqlab qo'yamiz
    if (!req.user.phone) {
      await User.update(req.user.id, { phone: phone.trim() }).catch(() => {});
    }

    const order = await Order.create({
      userId: req.user.id,
      items: orderItems,
      totalWon,
      region,
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      comment: comment?.trim() || null,
    });

    // Botdan tasdiq xabarini yuboramiz (javobni kutib turmaymiz)
    sendOrderConfirmation(order);

    res.status(201).json({ order: { id: order.id, totalWon: order.totalWon } });
  } catch (error) {
    next(error);
  }
}
