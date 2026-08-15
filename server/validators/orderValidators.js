import { z } from 'zod';
import { objectId } from './common.js';

const orderItemSchema = z.object({
  productId: objectId.optional(),
  id: objectId.optional(),
  quantity: z.coerce.number().int().min(1).optional().default(1),
  price: z.coerce.number().nonnegative().optional().default(0),
  productName: z.string().optional(),
  title: z.string().optional(),
  productImage: z.string().optional(),
  image: z.string().optional(),
}).refine((item) => item.productId || item.id, {
  message: 'Each item needs a productId',
});

export const placeOrderSchema = z.object({
  deliveryAddress: z.string().trim().min(1, 'Delivery address is required'),
  // totalAmount is accepted for the client's own display purposes but is never trusted for
  // pricing — the server always recomputes subtotal/deliveryCharge/codCharge/discount itself.
  totalAmount: z.coerce.number().nonnegative().optional(),
  items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
  paymentMethod: z.enum(['razorpay', 'cod']).optional().default('cod'),
  couponCode: z.string().trim().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['placed', 'shipped', 'delivered', 'cancelled']),
});
