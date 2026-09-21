import { Router } from 'express';
import { clientAuth } from '../middlewares/auth.middleware.js';
import {
  getMe,
  getProducts,
  getProduct,
  getMyOrders,
  createOrder,
  updateProfile,
} from '../controllers/cartController.js';

const router = Router();

// Barcha mijoz yo'llari Telegram initData orqali himoyalangan
router.use(clientAuth);

router.get('/me', getMe);
router.patch('/me', updateProfile);

router.get('/products', getProducts);
router.get('/products/:id', getProduct);

router.get('/orders', getMyOrders);
router.post('/orders', createOrder);

export default router;
