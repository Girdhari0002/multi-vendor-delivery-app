import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  label: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  country: { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'seller', 'admin', 'delivery'], default: 'customer' },
  phone: { type: String },
  profilePicture: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String },
  isBlocked: { type: Boolean, default: false },
  lastLogin: { type: Date },
  addresses: [addressSchema],
  notificationPrefs: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true }
  },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  // Email OTP verification (required before a self-registered account can log in)
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date },
  otpAttempts: { type: Number, default: 0 },
  // Delivery agent-specific fields
  vehicleType: { type: String },
  vehicleNumber: { type: String },
  isAvailable: { type: Boolean, default: true },
  currentLocation: {
    lat: { type: Number },
    lng: { type: Number },
    updatedAt: { type: Date }
  },
  // Seller-specific fields
  businessName: { type: String },
  businessType: { type: String },
  gstNumber: { type: String },
  bankDetails: {
    accountNumber: { type: String },
    ifsc: { type: String },
    bankName: { type: String }
  },
  upiId: { type: String },
  storeDescription: { type: String },
  storeLogo: { type: String },
  storeStatus: { type: String, enum: ['active', 'inactive'], default: 'active' },
  acceptsCOD: { type: Boolean, default: true },
  // Pickup location used when booking a courier (e.g. Borzo) for a seller's shipped orders.
  storeAddress: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: String },
    country: { type: String, default: 'India' },
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
