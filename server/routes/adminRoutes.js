import express from 'express';
import { getAllUsers, toggleBlockUser, adminDeleteProduct, getDashboardStats } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect, authorizeRoles('admin'));

router.get('/users', getAllUsers);
router.put('/block-user/:id', toggleBlockUser);
router.delete('/product/:id', adminDeleteProduct);
router.get('/dashboard', getDashboardStats);

export default router;
