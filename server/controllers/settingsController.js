import Settings from '../models/Settings.js';

// GET /api/settings - public, read-only subset of platform settings needed by the storefront
export const getPublicSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json({
      deliveryCharge: settings.deliveryCharge,
      codCharge: settings.codCharge,
      codAvailable: settings.codAvailable,
      taxRate: settings.taxRate,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
