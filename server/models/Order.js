import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  deliveryAddress: { type: String, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  paymentId: { type: String },
  orderStatus: { type: String, enum: ['placed', 'shipped', 'delivered', 'failed'], default: 'failed' },
  shippedAt: { type: Date },
  deliveredAt: { type: Date }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;
