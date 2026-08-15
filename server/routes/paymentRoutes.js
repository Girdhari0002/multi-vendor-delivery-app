import express from 'express';
import { createOrder, verifyPayment, refundPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/common.js';
import { createPaymentOrderSchema, verifyPaymentSchema, refundPaymentSchema } from '../validators/paymentValidators.js';

const router = express.Router();

router.post('/create-order', protect, validate({ body: createPaymentOrderSchema }), createOrder);
router.post('/verify', protect, validate({ body: verifyPaymentSchema }), verifyPayment);
router.post('/refund/:id', protect, authorizeRoles('admin'), validate({ params: idParamSchema, body: refundPaymentSchema }), refundPayment);

export default router;
