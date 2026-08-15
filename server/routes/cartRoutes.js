import express from 'express';
import { addToCart, getCart, removeFromCart } from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { addToCartSchema, removeFromCartSchema } from '../validators/cartValidators.js';

const router = express.Router();

router.use(protect); // All cart routes require auth

router.get('/', getCart);
router.post('/add', validate({ body: addToCartSchema }), addToCart);
router.delete('/remove', validate({ body: removeFromCartSchema }), removeFromCart);

export default router;
