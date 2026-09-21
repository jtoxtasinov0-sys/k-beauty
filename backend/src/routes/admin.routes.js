import { Router } from 'express';
import { adminAuth } from '../middlewares/auth.middleware.js';
import {
  login,
  getMeta,
  getStats,
  getOrders,
  updateOrderStatus,
  deleteOrder,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  upload,
} from '../controllers/adminController.js';

const router = Router();

// Kirish — himoyasiz
router.post('/login', login);

// Qolgan hamma narsa parol bilan
router.use(adminAuth);

router.get('/meta', getMeta);
router.get('/stats', getStats);

router.get('/orders', getOrders);
router.patch('/orders/:id/status', updateOrderStatus);
router.delete('/orders/:id', deleteOrder);

router.get('/products', getProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

router.post('/upload', upload.single('image'), uploadImage);

export default router;
