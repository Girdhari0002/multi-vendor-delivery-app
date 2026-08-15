import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// Get Seller Profile
export const getSellerProfile = async (req, res) => {
  try {
    const seller = await User.findById(req.user.id).select('-password');
    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({ message: 'Seller not found' });
    }
    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Seller Profile
export const updateSellerProfile = async (req, res) => {
  try {
    const { businessName, businessType, gstNumber, storeDescription, storeLogo, storeStatus } = req.body;
    
    const seller = await User.findByIdAndUpdate(
      req.user.id,
      {
        businessName,
        businessType,
        gstNumber,
        storeDescription,
        storeLogo,
        storeStatus
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Payment Information
export const getPaymentInfo = async (req, res) => {
  try {
    const seller = await User.findById(req.user.id);
    res.json({
      accountNumber: seller.bankDetails?.accountNumber || '',
      ifsc: seller.bankDetails?.ifsc || '',
      bankName: seller.bankDetails?.bankName || '',
      upiId: seller.upiId || ''
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Payment Information
export const updatePaymentInfo = async (req, res) => {
  try {
    const { accountNumber, ifsc, bankName, upiId } = req.body;
    
    const seller = await User.findByIdAndUpdate(
      req.user.id,
      {
        bankDetails: { accountNumber, ifsc, bankName },
        upiId
      },
      { new: true }
    ).select('-password');

    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Seller Stats
export const getSellerStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ sellerId: req.user.id });

    // An order can contain items from multiple sellers, so a seller's own orders/revenue
    // are derived from their items within each order, not a top-level Order.sellerId.
    const orders = await Order.find({}).populate('items.productId', 'sellerId');
    const myOrders = orders.filter((order) =>
      order.items.some((item) => item.productId?.sellerId?.toString() === req.user.id.toString())
    );

    const totalOrders = myOrders.length;
    const totalRevenue = myOrders
      .filter((o) => o.paymentMethod === 'cod' || o.paymentStatus === 'completed')
      .reduce((sum, order) => {
        const mine = order.items.reduce((itemSum, item) => {
          if (item.productId?.sellerId?.toString() === req.user.id.toString()) {
            return itemSum + item.price * item.quantity;
          }
          return itemSum;
        }, 0);
        return sum + mine;
      }, 0);

    // Calculate average rating from reviews
    let averageRating = 0;
    if (totalProducts > 0) {
      const products = await Product.find({ sellerId: req.user.id });
      const totalRating = products.reduce((sum, p) => sum + (p.rating || 0), 0);
      averageRating = totalRating / totalProducts;
    }

    res.json({
      totalProducts,
      totalOrders,
      totalRevenue,
      averageRating: averageRating || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
