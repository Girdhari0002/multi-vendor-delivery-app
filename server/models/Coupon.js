import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ['flat', 'percent'], required: true },
  discountValue: { type: Number, required: true, min: 0 },
  maxDiscount: { type: Number }, // caps the discount amount for percent-type coupons
  minOrderValue: { type: Number, default: 0 },
  expiryDate: { type: Date },
  usageLimit: { type: Number }, // total number of times this coupon may be used across all customers
  usedCount: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
