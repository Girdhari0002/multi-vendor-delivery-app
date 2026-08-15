import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles as checkRoles } from '../middleware/roleMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/common.js';
import { createProductSchema, updateProductSchema, productQuerySchema } from '../validators/productValidators.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Browse, search and manage products
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: List products with search, filtering, sorting and pagination
 *     tags: [Products]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema: { type: string }
 *         description: Case-insensitive title search
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [newest, price_asc, price_desc, rating] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 12, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated product list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products: { type: array, items: { type: object } }
 *                 page: { type: integer }
 *                 pages: { type: integer }
 *                 total: { type: integer }
 *   post:
 *     summary: Create a product (seller or admin)
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, description, price, category, stock]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               category: { type: string }
 *               stock: { type: integer }
 *               image: { type: string, format: binary }
 *               imageUrl: { type: string, description: "Alternative to uploading a file" }
 *     responses:
 *       201: { description: Product created }
 *       401: { description: Not authorized }
 */
router.route('/')
  .get(validate({ query: productQuerySchema }), getProducts)
  .post(protect, checkRoles('seller', 'admin'), upload.single('image'), validate({ body: createProductSchema }), createProduct);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a single product by id
 *     tags: [Products]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Product found }
 *       404: { description: Product not found }
 *   put:
 *     summary: Update a product (owning seller or admin)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Product updated }
 *   delete:
 *     summary: Delete a product (owning seller or admin)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Product removed }
 */
router.route('/:id')
  .get(validate({ params: idParamSchema }), getProductById)
  .put(protect, checkRoles('seller', 'admin'), upload.single('image'), validate({ params: idParamSchema, body: updateProductSchema }), updateProduct)
  .delete(protect, checkRoles('seller', 'admin'), validate({ params: idParamSchema }), deleteProduct);

export default router;
