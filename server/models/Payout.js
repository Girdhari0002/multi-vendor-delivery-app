import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  orderIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  grossAmount: { type: Number, required: true },
  commissionRate: { type: Number, required: true },
  commissionAmount: { type: Number, required: true },
  netPayable: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  paidAt: { type: Date },
}, { timestamps: true });

const Payout = mongoose.model('Payout', payoutSchema);
export default Payout;
