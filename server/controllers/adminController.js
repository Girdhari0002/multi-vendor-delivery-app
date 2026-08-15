import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Settings from '../models/Settings.js';

// GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    // Exclude accounts still pending email OTP verification — they aren't real registrations yet.
    const users = await User.find({ isVerified: true }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/block-user/:id
export const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot block admin' });
    }

    user.isBlocked = !user.isBlocked;
    const updatedUser = await user.save();
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete an admin account' });
    }
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Clean up resources owned by this user so nothing is left pointing at a deleted account
    if (user.role === 'seller') {
      await Product.deleteMany({ sellerId: user._id });
    }
    if (user.role === 'delivery') {
      await Order.updateMany({ deliveryAgentId: user._id }, { $unset: { deliveryAgentId: '' } });
    }

    await User.findByIdAndDelete(user._id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/admin/product/:id
export const adminDeleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/dashboard
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isVerified: true });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const orders = await Order.find({});
    
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/customers/:id - Get customer full profile
export const getCustomerDetails = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select('-password');
    if (!customer || customer.role !== 'customer') {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const orders = await Order.find({ userId: req.params.id }).populate('items.productId');
    const addresses = customer.addresses || [];

    res.json({
      customer,
      orders,
      addresses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/customers/:id/block
export const blockCustomer = async (req, res) => {
  try {
    const customer = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: true },
      { new: true }
    ).select('-password');
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/customers/:id/unblock
export const unblockCustomer = async (req, res) => {
  try {
    const customer = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: false },
      { new: true }
    ).select('-password');
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/sellers - Get all sellers with summary
export const getAllSellers = async (req, res) => {
  try {
    const sellers = await User.find({ role: 'seller', isVerified: true }).select('-password');

    // An order can contain items from multiple sellers, so per-seller stats are computed
    // from item-level data (item.productId.sellerId) rather than a top-level Order.sellerId,
    // which is never set at order-placement time.
    const productCounts = await Product.aggregate([
      { $group: { _id: '$sellerId', count: { $sum: 1 } } },
    ]);
    const productCountBySeller = new Map(productCounts.map((p) => [p._id.toString(), p.count]));

    const orders = await Order.find({}).populate('items.productId', 'sellerId');
    const statsBySeller = new Map();

    for (const order of orders) {
      const sellersInOrder = new Set();
      for (const item of order.items) {
        const sellerId = item.productId?.sellerId?.toString();
        if (!sellerId) continue;
        sellersInOrder.add(sellerId);

        if (!statsBySeller.has(sellerId)) {
          statsBySeller.set(sellerId, { orderIds: new Set(), completedOrderIds: new Set(), totalRevenue: 0 });
        }
        const stats = statsBySeller.get(sellerId);
        stats.orderIds.add(order._id.toString());
        // COD orders count toward revenue too — cash was (or will be) collected on delivery.
        if (order.paymentMethod === 'cod' || order.paymentStatus === 'completed') {
          stats.completedOrderIds.add(order._id.toString());
          stats.totalRevenue += item.price * item.quantity;
        }
      }
    }

    const sellersWithStats = sellers.map((seller) => {
      const stats = statsBySeller.get(seller._id.toString());
      return {
        ...seller.toObject(),
        productCount: productCountBySeller.get(seller._id.toString()) || 0,
        orderCount: stats?.orderIds.size || 0,
        completedOrderCount: stats?.completedOrderIds.size || 0,
        totalRevenue: Math.round((stats?.totalRevenue || 0) * 100) / 100,
      };
    });

    res.json(sellersWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/sellers/:id - Get seller full profile
export const getSellerDetails = async (req, res) => {
  try {
    const seller = await User.findById(req.params.id).select('-password');
    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({ message: 'Seller not found' });
    }

    const products = await Product.find({ sellerId: req.params.id });
    const orders = await Order.find({ sellerId: req.params.id }).populate('userId', 'name email phone');

    res.json({
      seller,
      products,
      orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/sellers/:id
export const updateSellerDetails = async (req, res) => {
  try {
    const { storeStatus } = req.body;
    const seller = await User.findByIdAndUpdate(
      req.params.id,
      { storeStatus },
      { new: true }
    ).select('-password');
    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/admin/sellers/:id
export const deleteSeller = async (req, res) => {
  try {
    // Delete seller's products and orders
    await Product.deleteMany({ sellerId: req.params.id });
    await Order.deleteMany({ sellerId: req.params.id });
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'Seller account deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/platform-stats
export const getPlatformStats = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer', isVerified: true });
    const totalSellers = await User.countDocuments({ role: 'seller', isVerified: true });
    const totalProducts = await Product.countDocuments();

    // Orders today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const totalOrdersToday = await Order.countDocuments({
      createdAt: { $gte: today }
    });

    const allOrders = await Order.find({});
    const totalRevenue = allOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const pendingOrders = await Order.countDocuments({
      orderStatus: { $in: ['placed', 'shipped'] }
    });

    res.json({
      totalCustomers,
      totalSellers,
      totalProducts,
      totalOrdersToday,
      totalRevenue,
      pendingOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/platform-settings
export const getPlatformSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/delivery-agents
export const getDeliveryAgents = async (req, res) => {
  try {
    const agents = await User.find({ role: 'delivery' }).select('-password');
    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/admin/delivery-agents - admin creates a delivery agent account
export const createDeliveryAgent = async (req, res) => {
  try {
    const { name, email, password, phone, vehicleType, vehicleNumber } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'A user with that email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const agent = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'delivery',
      phone,
      vehicleType,
      vehicleNumber,
      isVerified: true, // admin-created accounts skip OTP verification
    });

    res.status(201).json({
      _id: agent._id,
      name: agent.name,
      email: agent.email,
      role: agent.role,
      phone: agent.phone,
      vehicleType: agent.vehicleType,
      vehicleNumber: agent.vehicleNumber,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/admin/delivery-agents/:id
export const deleteDeliveryAgent = async (req, res) => {
  try {
    const agent = await User.findOne({ _id: req.params.id, role: 'delivery' });
    if (!agent) {
      return res.status(404).json({ message: 'Delivery agent not found' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Delivery agent removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/platform-settings
export const updatePlatformSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    Object.assign(settings, req.body);
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
