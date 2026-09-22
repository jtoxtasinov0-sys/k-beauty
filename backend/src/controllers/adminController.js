import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { config, CATEGORIES, ORDER_STATUSES, REGIONS } from '../config/default.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Story from '../models/Story.js';
import User from '../models/User.js';
import { sendStatusUpdate } from './botController.js';

// ==================== RASM YUKLASH ====================

fs.mkdirSync(config.uploadsDir, { recursive: true });

const ALLOWED = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `product-${unique}${ext}`);
  },
});

/** Admin panelda galereyadan rasm tanlash uchun. */
export const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED.includes(ext)) {
      return cb(new Error('Faqat rasm fayllari (jpg, png, webp, gif, avif)'));
    }
    cb(null, true);
  },
});

export function uploadImage(req, res) {
  if (!req.file) return res.status(400).json({ error: 'Rasm tanlanmadi' });
  res.json({ url: `/uploads/${req.file.filename}` });
}

// ==================== KIRISH ====================

export function login(req, res) {
  if (req.body?.password !== config.admin.password) {
    return res.status(401).json({ error: "Parol noto'g'ri" });
  }
  res.json({ token: config.admin.password });
}

export function getMeta(_req, res) {
  res.json({ categories: CATEGORIES, statuses: ORDER_STATUSES, regions: REGIONS });
}

export async function getStats(_req, res, next) {
  try {
    const [orderStats, productCount, userCount] = await Promise.all([
      Order.stats(),
      Product.count(),
      User.count(),
    ]);
    res.json({ ...orderStats, products: productCount, users: userCount });
  } catch (error) {
    next(error);
  }
}

// ==================== BUYURTMALAR ====================

export async function getOrders(req, res, next) {
  try {
    const orders = await Order.listAll({ status: req.query.status });
    res.json({ orders });
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!ORDER_STATUSES.some((s) => s.key === status)) {
      return res.status(400).json({ error: "Noto'g'ri holat" });
    }

    const order = await Order.updateStatus(req.params.id, status);
    sendStatusUpdate(order);
    res.json({ order });
  } catch (error) {
    next(error);
  }
}

export async function deleteOrder(req, res, next) {
  try {
    await Order.remove(req.params.id);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
}

// ==================== MAHSULOTLAR (CRUD) ====================

export async function getProducts(_req, res, next) {
  try {
    const products = await Product.listForAdmin();
    res.json({ products });
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req, res, next) {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ product });
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await Product.update(req.params.id, req.body);
    res.json({ product });
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    await Product.remove(req.params.id);

    // Yuklangan rasmni ham o'chiramiz (seed rasmlari saqlanib qoladi)
    if (product?.imageUrl?.startsWith('/uploads/product-')) {
      const file = path.join(config.uploadsDir, path.basename(product.imageUrl));
      fs.rm(file, { force: true }, () => {});
    }

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
}

// ==================== STORYLAR (CRUD) ====================

export async function getStories(_req, res, next) {
  try {
    res.json({ stories: await Story.listAll() });
  } catch (error) {
    next(error);
  }
}

export async function createStory(req, res, next) {
  try {
    const story = await Story.create(req.body);
    res.status(201).json({ story });
  } catch (error) {
    next(error);
  }
}

export async function updateStory(req, res, next) {
  try {
    const story = await Story.update(req.params.id, req.body);
    res.json({ story });
  } catch (error) {
    next(error);
  }
}

export async function deleteStory(req, res, next) {
  try {
    await Story.remove(req.params.id);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
}

// ==================== MIJOZLAR ====================

/** Kim kirgan, qaysi profil va telefon — hammasi bitta ro'yxatda. */
export async function getUsers(_req, res, next) {
  try {
    res.json({ users: await User.listForAdmin() });
  } catch (error) {
    next(error);
  }
}
