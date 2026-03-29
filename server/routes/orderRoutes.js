import express from 'express';
import { placeOrder, getUserOrders, getSellerOrders, getAdminOrders, updateOrderStatus } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', protect, placeOrder);
router.get('/user', protect, authorizeRoles('customer'), getUserOrders);
router.get('/seller', protect, authorizeRoles('seller'), getSellerOrders);
router.get('/admin', protect, authorizeRoles('admin'), getAdminOrders);
router.put('/:id/status', protect, authorizeRoles('seller', 'admin'), updateOrderStatus);

export default router;
