import express from 'express';
import { placeOrder, getUserOrders, getSellerOrders, getAdminOrders, updateOrderStatus, getOrderInvoice, getMyOrders, getOrderById, assignDeliveryAgent, cancelOrder } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/common.js';
import { placeOrderSchema, updateOrderStatusSchema } from '../validators/orderValidators.js';
import { assignAgentSchema } from '../validators/deliveryValidators.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Placing and managing orders
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Place an order from the current cart
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [deliveryAddress, items]
 *             properties:
 *               deliveryAddress: { type: string }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId: { type: string }
 *                     quantity: { type: integer }
 *                     price: { type: number }
 *               paymentMethod: { type: string, enum: [cod, razorpay], default: cod }
 *               couponCode: { type: string }
 *     responses:
 *       201: { description: Order created }
 *       400: { description: Validation failed or invalid coupon }
 */
router.post('/', protect, validate({ body: placeOrderSchema }), placeOrder);

/**
 * @swagger
 * /orders/user:
 *   get:
 *     summary: Get the logged-in customer's orders
 *     tags: [Orders]
 *     responses:
 *       200: { description: List of orders }
 */
router.get('/user', protect, authorizeRoles('customer'), getUserOrders);
router.get('/seller', protect, authorizeRoles('seller'), getSellerOrders);
router.get('/admin', protect, authorizeRoles('admin'), getAdminOrders);
router.get('/my-orders', protect, authorizeRoles('customer'), getMyOrders);

/**
 * @swagger
 * /orders/{id}/status:
 *   put:
 *     summary: Update an order's status (seller or admin)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [placed, shipped, delivered, cancelled] }
 *     responses:
 *       200: { description: Order updated }
 */
router.put('/:id/status', protect, authorizeRoles('seller', 'admin'), validate({ params: idParamSchema, body: updateOrderStatusSchema }), updateOrderStatus);
router.put('/:id/assign-agent', protect, authorizeRoles('admin'), validate({ params: idParamSchema, body: assignAgentSchema }), assignDeliveryAgent);
router.put('/:id/cancel', protect, authorizeRoles('customer'), validate({ params: idParamSchema }), cancelOrder);
router.get('/:id/invoice', protect, validate({ params: idParamSchema }), getOrderInvoice);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get a single order by id (owner or admin)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Order found }
 *       403: { description: Not authorized to view this order }
 *       404: { description: Order not found }
 */
router.get('/:id', protect, validate({ params: idParamSchema }), getOrderById);

export default router;
