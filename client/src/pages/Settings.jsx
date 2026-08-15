import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { FaCog, FaLock, FaBell, FaKey, FaMoneyBill, FaUser, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);

  // Account Settings
  const [accountData, setAccountData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Password Settings
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification Settings
  const [notificationData, setNotificationData] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
  });

  // Seller-specific
  const [sellerBankData, setSellerBankData] = useState({
    accountNumber: '',
    ifsc: '',
    bankName: '',
    upiId: '',
  });

  // Admin settings
  const [platformSettings, setPlatformSettings] = useState({
    deliveryCharge: 50,
    codCharge: 20,
    codAvailable: true,
    taxRate: 5,
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchNotificationPreferences();
    if (user.role === 'seller') {
      fetchSellerBankDetails();
    }
    if (user.role === 'admin') {
      fetchPlatformSettings();
    }
  }, [user, navigate]);

  const fetchNotificationPreferences = async () => {
    try {
      const response = await api.get('/users/notification-prefs');
      setNotificationData(response.data);
    } catch (error) {
      console.error('Failed to fetch notification preferences');
    }
  };

  const fetchSellerBankDetails = async () => {
    try {
      const response = await api.get('/sellers/payment-info');
      setSellerBankData(response.data);
    } catch (error) {
      console.error('Failed to fetch bank details');
    }
  };

  const fetchPlatformSettings = async () => {
    try {
      const response = await api.get('/admin/platform-settings');
      setPlatformSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch platform settings');
    }
  };

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSellerBankChange = (e) => {
    const { name, value } = e.target;
    setSellerBankData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlatformSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPlatformSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveAccount = async () => {
    try {
      setLoading(true);
      await api.put('/users/profile', accountData);
      toast.success('Account settings updated');
    } catch (error) {
      toast.error('Failed to update account settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (passwordData.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    try {
      setLoading(true);
      await api.put('/users/change-password', {
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setLoading(true);
      await api.put('/users/notification-prefs', notificationData);
      toast.success('Notification preferences updated');
    } catch (error) {
      toast.error('Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSellerBank = async () => {
    try {
      setLoading(true);
      await api.put('/sellers/payment-info', sellerBankData);
      toast.success('Payment details updated');
    } catch (error) {
      toast.error('Failed to update payment details');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlatformSettings = async () => {
    try {
      setLoading(true);
      await api.put('/admin/platform-settings', platformSettings);
      toast.success('Platform settings updated');
    } catch (error) {
      toast.error('Failed to update platform settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure? This action cannot be undone.')) {
      try {
        setLoading(true);
        await api.delete('/users/account');
        toast.success('Account deleted');
        logout();
      } catch (error) {
        toast.error('Failed to delete account');
      } finally {
        setLoading(false);
      }
    }
  };

  const Sidebar = () => (
    <div className="w-full md:w-64 bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-orange-500 text-white">
        <h3 className="font-bold text-lg">Settings</h3>
      </div>
      <nav className="p-4 space-y-2">
        <button
          onClick={() => setActiveTab('account')}
          className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${
            activeTab === 'account'
              ? 'bg-orange-100 text-orange-700 font-semibold'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <FaUser /> Account Settings
        </button>

        <button
          onClick={() => setActiveTab('password')}
          className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${
            activeTab === 'password'
              ? 'bg-orange-100 text-orange-700 font-semibold'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <FaLock /> Password & Security
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${
            activeTab === 'notifications'
              ? 'bg-orange-100 text-orange-700 font-semibold'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <FaBell /> Notifications
        </button>

        {user?.role === 'seller' && (
          <button
            onClick={() => setActiveTab('payment')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${
              activeTab === 'payment'
                ? 'bg-orange-100 text-orange-700 font-semibold'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaMoneyBill /> Payment Settings
          </button>
        )}

        {user?.role === 'admin' && (
          <button
            onClick={() => setActiveTab('platform')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${
              activeTab === 'platform'
                ? 'bg-orange-100 text-orange-700 font-semibold'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaCog /> Platform Settings
          </button>
        )}

        <button
          onClick={() => setActiveTab('privacy')}
          className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${
            activeTab === 'privacy'
              ? 'bg-orange-100 text-orange-700 font-semibold'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <FaKey /> Privacy
        </button>
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Settings</h1>

        <div className="flex flex-col md:flex-row gap-8">
          <Sidebar />

          {/* Content Area */}
          <div className="flex-1">
            {/* Account Settings */}
            {activeTab === 'account' && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <FaUser /> Account Settings
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={accountData.name}
                      onChange={handleAccountChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={accountData.email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={accountData.phone}
                      onChange={handleAccountChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                  <button
                    onClick={handleSaveAccount}
                    disabled={loading}
                    className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 font-semibold transition"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Password Settings */}
            {activeTab === 'password' && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <FaLock /> Password & Security
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                  <button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 font-semibold transition"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <FaBell /> Notification Preferences
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={notificationData.emailNotifications}
                      onChange={handleNotificationChange}
                      className="w-5 h-5 text-orange-600"
                    />
                    <div>
                      <label className="font-semibold text-gray-900">Email Notifications</label>
                      <p className="text-sm text-gray-600">Receive order updates via email</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      name="smsNotifications"
                      checked={notificationData.smsNotifications}
                      onChange={handleNotificationChange}
                      className="w-5 h-5 text-orange-600"
                    />
                    <div>
                      <label className="font-semibold text-gray-900">SMS Notifications</label>
                      <p className="text-sm text-gray-600">Receive order updates via SMS</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      name="pushNotifications"
                      checked={notificationData.pushNotifications}
                      onChange={handleNotificationChange}
                      className="w-5 h-5 text-orange-600"
                    />
                    <div>
                      <label className="font-semibold text-gray-900">Push Notifications</label>
                      <p className="text-sm text-gray-600">Receive app push notifications</p>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveNotifications}
                    disabled={loading}
                    className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 font-semibold transition"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* Seller Payment Settings */}
            {user?.role === 'seller' && activeTab === 'payment' && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <FaMoneyBill /> Payment Settings
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={sellerBankData.accountNumber}
                      onChange={handleSellerBankChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                      <input
                        type="text"
                        name="ifsc"
                        value={sellerBankData.ifsc}
                        onChange={handleSellerBankChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                      <input
                        type="text"
                        name="bankName"
                        value={sellerBankData.bankName}
                        onChange={handleSellerBankChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                    <input
                      type="text"
                      name="upiId"
                      value={sellerBankData.upiId}
                      onChange={handleSellerBankChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                  <button
                    onClick={handleSaveSellerBank}
                    disabled={loading}
                    className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 font-semibold transition"
                  >
                    Save Payment Information
                  </button>
                </div>
              </div>
            )}

            {/* Admin Platform Settings */}
            {user?.role === 'admin' && activeTab === 'platform' && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <FaCog /> Platform Settings
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Charge (₹)</label>
                    <input
                      type="number"
                      name="deliveryCharge"
                      value={platformSettings.deliveryCharge}
                      onChange={handlePlatformSettingChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">COD Charge (₹)</label>
                    <input
                      type="number"
                      name="codCharge"
                      value={platformSettings.codCharge}
                      onChange={handlePlatformSettingChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
                    <input
                      type="number"
                      name="taxRate"
                      value={platformSettings.taxRate}
                      onChange={handlePlatformSettingChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      name="codAvailable"
                      checked={platformSettings.codAvailable}
                      onChange={handlePlatformSettingChange}
                      className="w-5 h-5 text-orange-600"
                    />
                    <label className="font-semibold text-gray-900">Enable COD Platform-wide</label>
                  </div>
                  <button
                    onClick={handleSavePlatformSettings}
                    disabled={loading}
                    className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 font-semibold transition"
                  >
                    Save Platform Settings
                  </button>
                </div>
              </div>
            )}

            {/* Privacy & Security */}
            {activeTab === 'privacy' && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <FaKey /> Privacy & Security
                </h2>
                <div className="space-y-6">
                  <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <p className="text-sm text-yellow-800">
                      <strong>Warning:</strong> The following actions are permanent and cannot be undone.
                    </p>
                  </div>

                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-semibold transition flex items-center justify-center gap-2"
                  >
                    <FaTrash /> Delete My Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
