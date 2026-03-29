import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles as checkRoles } from '../middleware/roleMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, checkRoles('seller', 'admin'), upload.single('image'), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, checkRoles('seller', 'admin'), upload.single('image'), updateProduct)
  .delete(protect, checkRoles('seller', 'admin'), deleteProduct);

export default router;
