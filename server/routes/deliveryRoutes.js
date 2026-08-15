import express from 'express';
import { protect, role } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/common.js';
import { updateLocationSchema } from '../validators/deliveryValidators.js';
import * as deliveryController from '../controllers/deliveryController.js';

const router = express.Router();

router.use(protect, role('delivery'));

router.get('/orders', deliveryController.getAssignedOrders);
router.get('/orders/history', deliveryController.getDeliveryHistory);
router.post('/orders/:id/location', validate({ params: idParamSchema, body: updateLocationSchema }), deliveryController.updateMyLocation);
router.put('/orders/:id/deliver', validate({ params: idParamSchema }), deliveryController.markDelivered);

export default router;
