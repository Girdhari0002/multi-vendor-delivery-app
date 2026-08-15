import Coupon from '../models/Coupon.js';
import { resolveCoupon } from '../services/coupon.js';

// GET /api/coupons (Admin)
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/coupons (Admin)
export const createCoupon = async (req, res) => {
  try {
    const exists = await Coupon.findOne({ code: req.body.code.trim().toUpperCase() });
    if (exists) {
      return res.status(400).json({ message: 'A coupon with this code already exists' });
    }
    const coupon = await Coupon.create({ ...req.body, code: req.body.code.trim().toUpperCase() });
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/coupons/:id (Admin)
export const updateCoupon = async (req, res) => {
  try {
    const update = { ...req.body };
    if (update.code) update.code = update.code.trim().toUpperCase();
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/coupons/:id (Admin)
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.json({ message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/coupons/validate (Customer) - checks a coupon without applying it (used at checkout)
export const validateCoupon = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    const { coupon, discount, error } = await resolveCoupon(code, orderTotal);

    if (error) {
      return res.status(400).json({ message: error });
    }

    res.json({
      code: coupon.code,
      discount,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
