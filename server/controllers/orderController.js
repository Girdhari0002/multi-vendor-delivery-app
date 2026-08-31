import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Settings from '../models/Settings.js';
import { resolveCoupon } from '../services/coupon.js';
import { sendEmail } from '../services/mailer.js';
import { createDeliveryOrder } from '../services/borzo.js';
import logger from '../config/logger.js';

// POST /api/orders
export const placeOrder = async (req, res) => {
  try {
    // Check authentication
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { deliveryAddress, items, paymentMethod = 'cod', couponCode } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    if (!deliveryAddress) {
      return res.status(400).json({ message: 'Delivery address is required' });
    }

    const settings = await Settings.getSettings();
    if (paymentMethod === 'cod' && !settings.codAvailable) {
      return res.status(400).json({ message: 'Cash on delivery is currently unavailable' });
    }

    // Ensure items have required fields
    const itemProductIds = items.map(item => item.productId || item.id).filter(Boolean);
    const itemProducts = await Product.find({ _id: { $in: itemProductIds } }).select('sellerId');
    const sellerIdByProduct = new Map(itemProducts.map(p => [p._id.toString(), p.sellerId]));

    const processedItems = items.map(item => {
      const productId = item.productId || item.id;
      return {
        productId,
        sellerId: sellerIdByProduct.get(String(productId)),
        quantity: item.quantity || 1,
        price: item.price || 0,
        productName: item.productName || item.title || 'Product',
        productImage: item.productImage || item.image || ''
      };
    });

    // Calculate totals — charges always come from admin-configured settings, never trusted from the client
    const subtotal = processedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryCharge = settings.deliveryCharge;
    const codCharge = paymentMethod === 'cod' ? settings.codCharge : 0;

    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const result = await resolveCoupon(couponCode, subtotal);
      if (result.error) {
        return res.status(400).json({ message: result.error });
      }
      discount = result.discount;
      appliedCoupon = result.coupon;
    }

    const finalTotal = Math.max(subtotal + deliveryCharge + codCharge - discount, 0);

    const order = new Order({
      userId: req.user._id,
      items: processedItems,
      subtotal,
      deliveryCharge,
      codCharge,
      discount,
      couponCode: appliedCoupon?.code,
      totalPrice: finalTotal,
      deliveryAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      orderStatus: 'placed',
      customer: {
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });

    const savedOrder = await order.save();

    if (appliedCoupon) {
      appliedCoupon.usedCount += 1;
      await appliedCoupon.save();
    }

    // Clear user cart
    await Cart.findOneAndUpdate({ userId: req.user._id }, { $set: { items: [] } });

    // Only COD orders are "confirmed" at this point — Razorpay orders are still unpaid here
    // (the client creates this order record, then opens the Razorpay popup; payment isn't
    // confirmed until paymentController.verifyPayment runs, which sends its own email).
    if (paymentMethod === 'cod' && user.notificationPrefs?.email !== false) {
      sendEmail({
        to: user.email,
        subject: `Order confirmed — #${savedOrder._id.toString().slice(-6)}`,
        html: `<p>Hi ${user.name},</p><p>Your order has been placed successfully. Total: ₹${finalTotal.toFixed(2)}.</p><p>We'll notify you as it ships.</p>`,
      }).catch(() => {});
    }

    res.status(201).json(savedOrder);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: error.message || 'Failed to place order' });
  }
};

// GET /api/orders/user
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('items.productId')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/orders/my-orders - Alternative name for customer orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('items.productId', 'title price image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/orders/seller
export const getSellerOrders = async (req, res) => {
  try {
    // COD orders stay paymentStatus:'pending' until cash is collected on delivery, so sellers
    // still need to see and fulfill them; only unpaid Razorpay orders should stay hidden.
    const orders = await Order.find({
      $or: [{ paymentMethod: 'cod' }, { paymentStatus: 'completed' }],
    }).populate('items.productId', 'title price sellerId image').populate('userId', 'name email');

    const sellerOrders = orders.filter(order => {
      return order.items.some(item => {
        // Prefer the sellerId snapshotted on the item; fall back to the populated product for
        // orders placed before that snapshot existed (only works if the product still exists).
        const itemSellerId = item.sellerId?.toString() || item.productId?.sellerId?.toString();
        return itemSellerId === req.user._id.toString();
      });
    });

    res.json(sellerOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/orders/admin
export const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/orders/:id - Get single order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId')
      .populate('items.productId');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user has access to this order
    if (order.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/orders/:id/invoice
export const getOrderInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId')
      .populate('items.productId');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization - seller or admin can view
    if (order.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Get seller information (assumed to be stored with first product's seller)
    let sellerInfo = null;
    if (order.items.length > 0) {
      const product = order.items[0].productId;
      if (product && product.sellerId) {
        const seller = await User.findById(product.sellerId);
        sellerInfo = {
          businessName: seller?.businessName || 'Store Name',
          businessAddress: seller?.address || 'Store Address',
          phone: seller?.phone || 'N/A'
        };
      }
    }

    res.json({
      order,
      sellerInfo: sellerInfo || {}
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate('items.productId', 'sellerId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Validate status is in allowed enum values
    const validStatuses = ['placed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Valid values: ${validStatuses.join(', ')}` });
    }

    // Ensure required fields exist (for old orders)
    if (!order.totalPrice) order.totalPrice = 0;
    if (!order.subtotal) order.subtotal = 0;
    if (!order.paymentStatus) order.paymentStatus = 'pending';

    const wasPlaced = order.orderStatus === 'placed';
    order.orderStatus = status;
    if (status === 'shipped') {
      order.shippedAt = new Date();
    } else if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    // Book a courier pickup with Borzo the moment an order first goes out for shipping —
    // optional: only runs if BORZO_API_TOKEN is configured, and never blocks the status
    // update itself (seller can still mark shipped and retry booking later).
    let borzoWarning = null;
    if (status === 'shipped' && wasPlaced && process.env.BORZO_API_TOKEN) {
      try {
        const sellerId = order.items[0]?.sellerId || order.items[0]?.productId?.sellerId;
        const seller = sellerId ? await User.findById(sellerId) : null;

        if (!seller?.storeAddress?.street) {
          borzoWarning = 'Courier not booked: seller has not set a pickup address in their store profile.';
        } else if (!seller?.phone || !order.customer?.phone) {
          borzoWarning = 'Courier not booked: seller or customer phone number is missing.';
        } else {
          const pickupAddress = [seller.storeAddress.street, seller.storeAddress.city, seller.storeAddress.state, seller.storeAddress.zip]
            .filter(Boolean).join(', ');
          const orderRef = order._id.toString().slice(-6);
          const booking = await createDeliveryOrder({
            orderId: orderRef,
            matter: `Order #${orderRef}`,
            pickupAddress,
            pickupName: seller.businessName || seller.name,
            pickupPhone: seller.phone,
            dropAddress: order.deliveryAddress,
            dropName: order.customer.name,
            dropPhone: order.customer.phone,
          });
          order.borzo = { orderId: booking.order?.order_id?.toString(), status: booking.order?.status };
        }
      } catch (borzoError) {
        logger.error(`Borzo booking failed for order ${order._id}: ${borzoError.message}`);
        borzoWarning = `Courier booking failed: ${borzoError.message}`;
      }
    }

    const updatedOrder = await order.save();
    logger.info(`Order ${order._id} status updated to ${status}`);

    // Emit real-time update via Socket.io
    if (req.io) {
      req.io.to(order.userId.toString()).emit('orderStatusUpdated', {
        orderId: order._id.toString(),
        status: status,
        orderNumber: order._id
      });
    }

    if (order.customer?.email && (status === 'shipped' || status === 'delivered' || status === 'cancelled')) {
      sendEmail({
        to: order.customer.email,
        subject: `Order #${order._id.toString().slice(-6)} is now ${status}`,
        html: `<p>Hi ${order.customer.name || ''},</p><p>Your order #${order._id.toString().slice(-6)} status has been updated to <strong>${status}</strong>.</p>`,
      }).catch(() => {});
    }

    res.json(borzoWarning ? { ...updatedOrder.toObject(), borzoWarning } : updatedOrder);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: error.message || 'Failed to update order status' });
  }
};

// PUT /api/orders/:id/cancel (Customer, own order — only while still 'placed')
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    if (order.orderStatus !== 'placed') {
      return res.status(400).json({ message: `Cannot cancel an order that is already ${order.orderStatus}` });
    }
    // Online payments need a refund, which this endpoint doesn't issue — keep those out of
    // self-serve cancellation rather than take the customer's money with no way back.
    if (order.paymentMethod === 'razorpay' && order.paymentStatus === 'completed') {
      return res.status(400).json({ message: 'This order was paid online — please contact support for a refund' });
    }

    order.orderStatus = 'cancelled';
    await order.save();

    if (req.io) {
      req.io.to(order.userId.toString()).emit('orderStatusUpdated', {
        orderId: order._id.toString(),
        status: 'cancelled',
        orderNumber: order._id,
      });
    }

    if (order.customer?.email) {
      sendEmail({
        to: order.customer.email,
        subject: `Order #${order._id.toString().slice(-6)} cancelled`,
        html: `<p>Hi ${order.customer.name || ''},</p><p>Your order #${order._id.toString().slice(-6)} has been cancelled as requested.</p>`,
      }).catch(() => {});
    }

    res.json(order);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: error.message || 'Failed to cancel order' });
  }
};

// PUT /api/orders/:id/assign-agent (Admin only)
export const assignDeliveryAgent = async (req, res) => {
  try {
    const { agentId } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const agent = await User.findOne({ _id: agentId, role: 'delivery' });
    if (!agent) {
      return res.status(404).json({ message: 'Delivery agent not found' });
    }

    order.deliveryAgentId = agent._id;

    // Assigning an agent is the dispatch step — the agent's own dashboard only lists orders
    // with orderStatus 'shipped', so without this an assigned order would never show up there.
    const justShipped = order.orderStatus === 'placed';
    if (justShipped) {
      order.orderStatus = 'shipped';
      order.shippedAt = new Date();
    }

    const updatedOrder = await order.save();

    if (req.io) {
      req.io.to(order.userId.toString()).emit('deliveryAgentAssigned', {
        orderId: order._id.toString(),
        agentName: agent.name,
      });
      if (justShipped) {
        req.io.to(order.userId.toString()).emit('orderStatusUpdated', {
          orderId: order._id.toString(),
          status: 'shipped',
          orderNumber: order._id,
        });
      }
    }

    if (justShipped && order.customer?.email) {
      sendEmail({
        to: order.customer.email,
        subject: `Order #${order._id.toString().slice(-6)} is now shipped`,
        html: `<p>Hi ${order.customer.name || ''},</p><p>Your order #${order._id.toString().slice(-6)} status has been updated to <strong>shipped</strong>.</p>`,
      }).catch(() => {});
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
