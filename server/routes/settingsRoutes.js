import express from 'express';
import { getPublicSettings } from '../controllers/settingsController.js';

const router = express.Router();

/**
 * @swagger
 * /settings:
 *   get:
 *     summary: Get public platform settings (delivery charge, COD charge, etc.) used at checkout
 *     tags: [Settings]
 *     security: []
 *     responses:
 *       200: { description: Current platform settings }
 */
router.get('/', getPublicSettings);

export default router;
