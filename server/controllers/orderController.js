import Order from '../models/Order.js';
import Cart from '../models/Cart.js';

// POST /api/orders
export const placeOrder = async (req, res) => {
  try {
    const { deliveryAddress, totalAmount, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    const order = new Order({
      userId: req.user._id,
      items,
      deliveryAddress,
      totalAmount
    });

    const savedOrder = await order.save();

    // Clear user cart
    await Cart.findOneAndUpdate({ userId: req.user._id }, { $set: { items: [] } });

    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

// GET /api/orders/seller
export const getSellerOrders = async (req, res) => {
  try {
    // A seller's orders are any orders that contain products created by this seller.
    // To do this properly, we need to populate products and filter...
    // Or we simply return all orders for now and filter on frontend or complex aggregation.
    // For simplicity with Mongoose, let's find all orders, populate productId, and filter in NodeJS.
    
    const orders = await Order.find({ paymentStatus: 'paid' }).populate('items.productId', 'title price sellerId image').populate('userId', 'name email');
    
    const sellerOrders = orders.filter(order => {
      // Check if any item in this order belongs to the seller
      return order.items.some(item => 
        item.productId && item.productId.sellerId.toString() === req.user._id.toString()
      );
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

// PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'placed', 'shipped', 'delivered'
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = status;
    if (status === 'shipped') {
      order.shippedAt = new Date();
    } else if (status === 'delivered') {
      order.deliveredAt = new Date();
    }
    
    const updatedOrder = await order.save();

    req.io.to(order.userId.toString()).emit('orderStatusUpdated', { 
      orderId: order._id, 
      status 
    });

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
