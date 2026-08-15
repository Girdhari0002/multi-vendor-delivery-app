import User from '../models/User.js';
import Order from '../models/Order.js';
import bcrypt from 'bcrypt';

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update User Profile
export const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, dateOfBirth, gender, profilePicture } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, dateOfBirth, gender, profilePicture, lastLogin: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Change Password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    // Verify old password
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User Addresses
export const getUserAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.addresses || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add Address
export const addAddress = async (req, res) => {
  try {
    const { label, street, city, state, zip, country, isDefault } = req.body;
    const user = await User.findById(req.user.id);

    // If this is default, unset other defaults
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push({
      label,
      street,
      city,
      state,
      zip,
      country,
      isDefault
    });

    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Address
export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { label, street, city, state, zip, country, isDefault } = req.body;
    const user = await User.findById(req.user.id);

    const address = user.addresses.id(id);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // If this is default, unset other defaults
    if (isDefault) {
      user.addresses.forEach(addr => {
        if (addr._id.toString() !== id) {
          addr.isDefault = false;
        }
      });
    }

    Object.assign(address, { label, street, city, state, zip, country, isDefault });
    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Address
export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user.id);

    user.addresses = user.addresses.filter(addr => addr._id.toString() !== id);
    await user.save();

    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Notification Preferences
export const getNotificationPrefs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.notificationPrefs || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Notification Preferences
export const updateNotificationPrefs = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { notificationPrefs: req.body },
      { new: true }
    );
    res.json(user.notificationPrefs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/users/wishlist
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    res.json(user.wishlist || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/users/wishlist/:id - add a product to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.wishlist.some((productId) => productId.toString() === req.params.id)) {
      user.wishlist.push(req.params.id);
      await user.save();
    }
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/users/wishlist/:id
export const removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.wishlist = user.wishlist.filter((productId) => productId.toString() !== req.params.id);
    await user.save();
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Account
export const deleteAccount = async (req, res) => {
  try {
    // Delete user and associated orders
    await Order.deleteMany({ userId: req.user.id });
    await User.findByIdAndDelete(req.user.id);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
