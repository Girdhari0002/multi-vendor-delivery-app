import Order from '../models/Order.js';
import Payout from '../models/Payout.js';
import User from '../models/User.js';

const DEFAULT_COMMISSION_RATE = 10; // percent

// Sums up a seller's share of an order's items (an order can contain items from multiple sellers).
const sellerShareOfOrder = (order, sellerId) => {
  return order.items.reduce((sum, item) => {
    const product = item.productId;
    if (product && product.sellerId && product.sellerId.toString() === sellerId.toString()) {
      return sum + item.price * item.quantity;
    }
    return sum;
  }, 0);
};

// POST /api/admin/payouts/generate (Admin) - settles all not-yet-paid delivered orders for a seller since their last payout
export const generatePayout = async (req, res) => {
  try {
    const { sellerId, commissionRate = DEFAULT_COMMISSION_RATE } = req.body;

    const seller = await User.findOne({ _id: sellerId, role: 'seller' });
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    const lastPayout = await Payout.findOne({ sellerId }).sort({ periodEnd: -1 });
    const periodStart = lastPayout ? lastPayout.periodEnd : new Date(0);
    const periodEnd = new Date();

    // COD orders are eligible too: cash was collected on delivery, and this payout is what
    // settles the seller's share of that cash (minus platform commission) via bank transfer.
    const orders = await Order.find({
      orderStatus: 'delivered',
      $or: [{ paymentMethod: 'cod' }, { paymentStatus: 'completed' }],
      deliveredAt: { $gt: periodStart, $lte: periodEnd },
    }).populate('items.productId', 'sellerId');

    const includedOrderIds = [];
    let grossAmount = 0;

    for (const order of orders) {
      const share = sellerShareOfOrder(order, sellerId);
      if (share > 0) {
        grossAmount += share;
        includedOrderIds.push(order._id);
      }
    }

    if (grossAmount === 0) {
      return res.status(400).json({ message: 'No new delivered orders to settle for this seller' });
    }

    const commissionAmount = Math.round(((grossAmount * commissionRate) / 100) * 100) / 100;
    const netPayable = Math.round((grossAmount - commissionAmount) * 100) / 100;

    const payout = await Payout.create({
      sellerId,
      periodStart,
      periodEnd,
      orderIds: includedOrderIds,
      grossAmount: Math.round(grossAmount * 100) / 100,
      commissionRate,
      commissionAmount,
      netPayable,
    });

    res.status(201).json(payout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/payouts (Admin) - optionally filter by ?sellerId=
export const getAllPayouts = async (req, res) => {
  try {
    const filter = req.query.sellerId ? { sellerId: req.query.sellerId } : {};
    const payouts = await Payout.find(filter).populate('sellerId', 'name businessName email').sort({ createdAt: -1 });
    res.json(payouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/payouts/:id/pay (Admin) - marks a payout as paid (manual bank transfer confirmation)
export const markPayoutPaid = async (req, res) => {
  try {
    const payout = await Payout.findById(req.params.id);
    if (!payout) {
      return res.status(404).json({ message: 'Payout not found' });
    }
    payout.status = 'paid';
    payout.paidAt = new Date();
    await payout.save();
    res.json(payout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/sellers/payouts (Seller) - the logged-in seller's own payout history
export const getSellerPayouts = async (req, res) => {
  try {
    const payouts = await Payout.find({ sellerId: req.user.id }).sort({ createdAt: -1 });
    res.json(payouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
