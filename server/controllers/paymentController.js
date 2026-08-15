import crypto from 'crypto';
import Razorpay from 'razorpay';
import Order from '../models/Order.js';
import logger from '../config/logger.js';
import { sendEmail } from '../services/mailer.js';

// POST /api/payment/create-order
export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      logger.error('Missing Razorpay credentials');
      return res.status(500).json({ message: 'Payment gateway not configured' });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`
    };

    const order = await instance.orders.create(options);

    if (!order) {
      return res.status(500).json({ message: 'Failed to create payment order' });
    }

    res.json(order);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: error.message || 'Payment gateway error' });
  }
};

// POST /api/payment/verify
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      if (orderId) {
        const order = await Order.findById(orderId);
        if (order) {
          order.paymentStatus = 'completed';
          order.paymentId = razorpay_payment_id;
          order.orderStatus = 'placed';
          await order.save();

          // Payment is only actually confirmed here — this is the right place to send the
          // "order confirmed" email for Razorpay orders (not at order creation, before payment).
          if (order.customer?.email) {
            sendEmail({
              to: order.customer.email,
              subject: `Order confirmed — #${order._id.toString().slice(-6)}`,
              html: `<p>Hi ${order.customer.name || ''},</p><p>Your payment was received and your order has been placed successfully. Total: ₹${order.totalPrice.toFixed(2)}.</p><p>We'll notify you as it ships.</p>`,
            }).catch(() => {});
          }
        }
      }
      return res.status(200).json({ message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/payment/refund/:id (Admin only) - refunds a Razorpay payment for a cancelled/failed order
export const refundPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.paymentMethod !== 'razorpay' || order.paymentStatus !== 'completed') {
      return res.status(400).json({ message: 'Only completed online payments can be refunded' });
    }
    if (order.refundStatus === 'completed') {
      return res.status(400).json({ message: 'This order has already been refunded' });
    }
    if (!order.paymentId) {
      return res.status(400).json({ message: 'No payment id on this order to refund' });
    }

    const { amount, notes } = req.body;

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    order.refundStatus = 'pending';
    await order.save();

    try {
      const refund = await instance.payments.refund(order.paymentId, {
        amount: amount ? Math.round(amount * 100) : undefined, // omit for full refund
        notes: notes ? { reason: notes } : undefined,
      });

      order.refundStatus = 'completed';
      order.refundId = refund.id;
      order.refundAmount = amount || order.totalPrice;
      order.orderStatus = 'cancelled';
      await order.save();

      res.json({ message: 'Refund processed successfully', order });
    } catch (refundError) {
      order.refundStatus = 'failed';
      await order.save();
      throw refundError;
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: error.message || 'Refund failed' });
  }
};
