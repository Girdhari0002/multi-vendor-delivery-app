import express from 'express';
import { addReview, getReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { objectId } from '../validators/common.js';
import { addReviewSchema } from '../validators/reviewValidators.js';
import { z } from 'zod';

const router = express.Router();

router.post('/', protect, validate({ body: addReviewSchema }), addReview);
router.get('/:productId', validate({ params: z.object({ productId: objectId }) }), getReviews);

export default router;
