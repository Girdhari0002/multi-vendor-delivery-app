import Coupon from '../models/Coupon.js';

// Looks up a coupon by code and validates it against the given order total.
// Returns { coupon, discount } on success, or { error } with a user-facing message on failure.
export const resolveCoupon = async (code, orderTotal) => {
  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });

  if (!coupon || !coupon.active) {
    return { error: 'Invalid coupon code' };
  }
  if (coupon.expiryDate && coupon.expiryDate < new Date()) {
    return { error: 'This coupon has expired' };
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { error: 'This coupon has reached its usage limit' };
  }
  if (orderTotal < (coupon.minOrderValue || 0)) {
    return { error: `Minimum order value for this coupon is ₹${coupon.minOrderValue}` };
  }

  let discount = coupon.discountType === 'percent'
    ? (orderTotal * coupon.discountValue) / 100
    : coupon.discountValue;

  if (coupon.maxDiscount) {
    discount = Math.min(discount, coupon.maxDiscount);
  }
  discount = Math.min(discount, orderTotal);

  return { coupon, discount: Math.round(discount * 100) / 100 };
};
