import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { FaCog, FaLock, FaBell, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const fetchPlatformSettings = async () => {
    try {
      const response = await api.get('/admin/platform-settings');
      if (response.data) {
        setPlatformSettings(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch platform settings');
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationData((prev) => ({ ...prev, [name]: checked }));
  };

  const handlePlatformSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPlatformSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
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
    try {
      setDeleting(true);
      await api.delete('/users/account');
      toast.success('Account deleted successfully');
      setShowDeleteConfirm(false);
      logout();
    } catch (error) {
      toast.error('Failed to delete account');
      setDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Account Settings</h1>
          <p className="mt-2 text-sm text-slate-500">Manage your preferences, security, and account configuration.</p>
        </div>

        <div className="space-y-6">
          {/* Security Section */}
          <Card padding="lg" className="border-0 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <FaLock className="text-lg" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Security & Password</h2>
            </div>
            
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <Input
                label="Current Password"
                type="password"
                name="currentPassword"
                required
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
              />
              <Input
                label="New Password"
                type="password"
                name="newPassword"
                required
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
              />
              <Input
                label="Confirm New Password"
                type="password"
                name="confirmPassword"
                required
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
              />
              <div className="pt-2">
                <Button type="submit" loading={loading && passwordData.newPassword !== ''}>
                  Change Password
                </Button>
              </div>
            </form>
          </Card>

          {/* Notification Preferences */}
          <Card padding="lg" className="border-0 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <FaBell className="text-lg" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Notification Preferences</h2>
            </div>
            
            <div className="space-y-5 max-w-2xl">
              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="flex items-center h-6">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={notificationData.emailNotifications}
                    onChange={handleNotificationChange}
                    className="w-5 h-5 text-orange-500 border-slate-300 rounded focus:ring-orange-500 transition-colors"
                  />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">Email Notifications</p>
                  <p className="text-sm text-slate-500">Receive order updates, promotions, and account alerts via email.</p>
                </div>
              </label>

              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="flex items-center h-6">
                  <input
                    type="checkbox"
                    name="smsNotifications"
                    checked={notificationData.smsNotifications}
                    onChange={handleNotificationChange}
                    className="w-5 h-5 text-orange-500 border-slate-300 rounded focus:ring-orange-500 transition-colors"
                  />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">SMS Notifications</p>
                  <p className="text-sm text-slate-500">Receive critical delivery updates and OTPs directly via SMS.</p>
                </div>
              </label>

              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="flex items-center h-6">
                  <input
                    type="checkbox"
                    name="pushNotifications"
                    checked={notificationData.pushNotifications}
                    onChange={handleNotificationChange}
                    className="w-5 h-5 text-orange-500 border-slate-300 rounded focus:ring-orange-500 transition-colors"
                  />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">Push Notifications</p>
                  <p className="text-sm text-slate-500">Receive app push notifications for immediate order tracking.</p>
                </div>
              </label>

              <div className="pt-2">
                <Button onClick={handleSaveNotifications} loading={loading && passwordData.newPassword === ''}>
                  Save Preferences
                </Button>
              </div>
            </div>
          </Card>

          {/* Platform Settings (Admin Only) */}
          {user.role === 'admin' && (
            <Card padding="lg" className="border-0 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                  <FaCog className="text-lg" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Platform Configuration</h2>
              </div>
              
              <div className="space-y-6 max-w-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Delivery Charge (₹)"
                    type="number"
                    name="deliveryCharge"
                    value={platformSettings.deliveryCharge}
                    onChange={handlePlatformSettingChange}
                  />
                  <Input
                    label="COD Charge (₹)"
                    type="number"
                    name="codCharge"
                    value={platformSettings.codCharge}
                    onChange={handlePlatformSettingChange}
                  />
                  <Input
                    label="Tax Rate (%)"
                    type="number"
                    name="taxRate"
                    value={platformSettings.taxRate}
                    onChange={handlePlatformSettingChange}
                  />
                </div>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="codAvailable"
                    checked={platformSettings.codAvailable}
                    onChange={handlePlatformSettingChange}
                    className="w-5 h-5 text-orange-500 border-slate-300 rounded focus:ring-orange-500 transition-colors"
                  />
                  <span className="font-semibold text-slate-900">Enable Cash on Delivery (COD) Platform-wide</span>
                </label>

                <div className="pt-2">
                  <Button onClick={handleSavePlatformSettings} loading={loading && passwordData.newPassword === ''}>
                    Save Platform Settings
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Account Deletion */}
          <Card padding="lg" className="border-0 shadow-sm ring-1 ring-red-100 bg-red-50/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg text-red-600">
                <FaTrash className="text-lg" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Danger Zone</h2>
            </div>
            
            <p className="text-sm text-slate-600 mb-6">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            
            <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
              Delete Account
            </Button>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you absolutely sure you want to delete your account? This action is permanent, and all your personal information, order history, and preferences will be erased forever."
        confirmLabel="Yes, delete my account"
        cancelLabel="No, keep it"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default Settings;
