import express from 'express';
import { getAllUsers, toggleBlockUser, deleteUser, adminDeleteProduct, getDashboardStats, getCustomerDetails, blockCustomer, unblockCustomer, getAllSellers, getSellerDetails, updateSellerDetails, deleteSeller, getPlatformStats, getPlatformSettings, updatePlatformSettings, getDeliveryAgents, createDeliveryAgent, deleteDeliveryAgent } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/common.js';
import { platformSettingsSchema, updateSellerStatusSchema } from '../validators/adminValidators.js';
import { createDeliveryAgentSchema } from '../validators/deliveryValidators.js';
import { generatePayoutSchema } from '../validators/payoutValidators.js';
import { generatePayout, getAllPayouts, markPayoutPaid } from '../controllers/payoutController.js';

const router = express.Router();

router.use(protect, authorizeRoles('admin'));

// Existing routes
router.get('/users', getAllUsers);
router.put('/block-user/:id', validate({ params: idParamSchema }), toggleBlockUser);
router.delete('/users/:id', validate({ params: idParamSchema }), deleteUser);
router.delete('/product/:id', validate({ params: idParamSchema }), adminDeleteProduct);
router.get('/dashboard', getDashboardStats);

// New customer management routes
router.get('/customers/:id', validate({ params: idParamSchema }), getCustomerDetails);
router.put('/customers/:id/block', validate({ params: idParamSchema }), blockCustomer);
router.put('/customers/:id/unblock', validate({ params: idParamSchema }), unblockCustomer);

// New seller management routes
router.get('/sellers', getAllSellers);
router.get('/sellers/:id', validate({ params: idParamSchema }), getSellerDetails);
router.put('/sellers/:id', validate({ params: idParamSchema, body: updateSellerStatusSchema }), updateSellerDetails);
router.delete('/sellers/:id', validate({ params: idParamSchema }), deleteSeller);

// Delivery agent management
router.get('/delivery-agents', getDeliveryAgents);
router.post('/delivery-agents', validate({ body: createDeliveryAgentSchema }), createDeliveryAgent);
router.delete('/delivery-agents/:id', validate({ params: idParamSchema }), deleteDeliveryAgent);

// Seller payouts
router.get('/payouts', getAllPayouts);
router.post('/payouts/generate', validate({ body: generatePayoutSchema }), generatePayout);
router.put('/payouts/:id/pay', validate({ params: idParamSchema }), markPayoutPaid);

// Platform statistics and settings
router.get('/platform-stats', getPlatformStats);
router.get('/platform-settings', getPlatformSettings);
router.put('/platform-settings', validate({ body: platformSettingsSchema }), updatePlatformSettings);

export default router;
