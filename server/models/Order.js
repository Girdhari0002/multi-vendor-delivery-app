import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      // Snapshotted at order time, like productName/productImage — so seller-scoped queries
      // (dashboard stats, seller orders, payouts) still work after the product is deleted,
      // instead of relying on populating productId.sellerId at read time.
      sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      productName: { type: String },
      productImage: { type: String }
    }
  ],
  subtotal: { type: Number, required: true },
  deliveryCharge: { type: Number, default: 50 },
  discount: { type: Number, default: 0 },
  codCharge: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  deliveryAddress: { type: String, required: true },
  billingAddress: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    isDefault: Boolean
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    isDefault: Boolean
  },
  paymentMethod: { 
    type: String,
    enum: ['razorpay', 'cod'],
    default: 'cod'
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'pending' 
  },
  paymentId: { type: String },
  orderStatus: { 
    type: String, 
    enum: ['placed', 'shipped', 'delivered', 'cancelled'], 
    default: 'placed' 
  },
  invoiceNumber: { type: String },
  shippedAt: { type: Date },
  deliveredAt: { type: Date },
  customer: {
    name: String,
    email: String,
    phone: String
  },
  deliveryAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  currentLocation: {
    lat: { type: Number },
    lng: { type: Number },
    updatedAt: { type: Date }
  },
  couponCode: { type: String },
  refundStatus: { type: String, enum: ['none', 'pending', 'completed', 'failed'], default: 'none' },
  refundId: { type: String },
  refundAmount: { type: Number },
  // Third-party courier (Borzo) booking — set when the order is handed off for pickup.
  borzo: {
    orderId: { type: String },
    status: { type: String },
    courierName: { type: String },
    courierPhone: { type: String },
    trackingUrl: { type: String },
  }
}, { timestamps: true });

// Auto-generate invoice number
orderSchema.pre('save', async function() {
  if (!this.invoiceNumber) {
    this.invoiceNumber = `INV-${Date.now()}`;
  }
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
