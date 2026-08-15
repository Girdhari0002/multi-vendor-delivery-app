import Order from '../models/Order.js';
import { sendEmail } from '../services/mailer.js';

// GET /api/delivery/orders - orders assigned to the logged-in delivery agent, currently out for delivery
export const getAssignedOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      deliveryAgentId: req.user._id,
      orderStatus: 'shipped',
    })
      .populate('items.productId', 'title image')
      .sort({ shippedAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/delivery/orders/history - past orders this agent has delivered
export const getDeliveryHistory = async (req, res) => {
  try {
    const orders = await Order.find({
      deliveryAgentId: req.user._id,
      orderStatus: 'delivered',
    })
      .populate('items.productId', 'title image')
      .sort({ deliveredAt: -1 })
      .limit(50);

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/delivery/orders/:id/location - agent pushes their live location for an order
export const updateMyLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (!order.deliveryAgentId || order.deliveryAgentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not assigned to this order' });
    }

    const location = { lat, lng, updatedAt: new Date() };
    order.currentLocation = location;
    await order.save();

    // Also track on the agent's own profile for admin overview
    req.user.currentLocation = location;
    await req.user.save();

    if (req.io) {
      req.io.to(`order_${order._id}`).emit('locationUpdated', {
        orderId: order._id.toString(),
        ...location,
      });
    }

    res.json({ message: 'Location updated', location });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/delivery/orders/:id/deliver - agent marks an order as delivered
export const markDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (!order.deliveryAgentId || order.deliveryAgentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not assigned to this order' });
    }

    order.orderStatus = 'delivered';
    order.deliveredAt = new Date();
    await order.save();

    if (req.io) {
      req.io.to(order.userId.toString()).emit('orderStatusUpdated', {
        orderId: order._id.toString(),
        status: 'delivered',
        orderNumber: order._id,
      });
    }

    if (order.customer?.email) {
      sendEmail({
        to: order.customer.email,
        subject: `Order #${order._id.toString().slice(-6)} delivered`,
        html: `<p>Hi ${order.customer.name || ''},</p><p>Your order #${order._id.toString().slice(-6)} has been delivered. Thanks for shopping with us!</p>`,
      }).catch(() => {});
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
