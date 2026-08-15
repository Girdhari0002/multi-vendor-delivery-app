import mongoose from 'mongoose';

// Singleton document holding platform-wide settings, editable from the admin panel.
const settingsSchema = new mongoose.Schema({
  deliveryCharge: { type: Number, default: 50, min: 0 },
  codCharge: { type: Number, default: 20, min: 0 },
  codAvailable: { type: Boolean, default: true },
  taxRate: { type: Number, default: 5, min: 0 },
}, { timestamps: true });

settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
