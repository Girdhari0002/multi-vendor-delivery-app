import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { FaCamera, FaEdit, FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';

const SellerProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    gstNumber: '',
    storeDescription: '',
    storeLogo: '',
    storeStatus: 'active',
  });
  const [bankData, setBankData] = useState({
    accountNumber: '',
    ifsc: '',
    bankName: '',
    upiId: '',
  });
  const [editingBank, setEditingBank] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate('/login');
      return;
    }
    fetchSellerData();
  }, [user, navigate]);

  const fetchSellerData = async () => {
    try {
      setLoading(true);
      const [profileRes, statsRes] = await Promise.all([
        api.get('/sellers/profile'),
        api.get('/sellers/stats'),
      ]);

      setProfile(profileRes.data);
      setFormData({
        businessName: profileRes.data.businessName || '',
        businessType: profileRes.data.businessType || '',
        gstNumber: profileRes.data.gstNumber || '',
        storeDescription: profileRes.data.storeDescription || '',
        storeLogo: profileRes.data.storeLogo || '',
        storeStatus: profileRes.data.storeStatus || 'active',
      });
      setBankData({
        accountNumber: profileRes.data.bankDetails?.accountNumber || '',
        ifsc: profileRes.data.bankDetails?.ifsc || '',
        bankName: profileRes.data.bankDetails?.bankName || '',
        upiId: profileRes.data.upiId || '',
      });

      setStats(statsRes.data || {});
    } catch (error) {
      toast.error('Failed to load seller data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setBankData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, storeLogo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await api.put('/sellers/profile', formData);
      setProfile(formData);
      setEditing(false);
      toast.success('Profile updated successfully');
      fetchSellerData();
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    }
  };

  const handleSaveBankDetails = async () => {
    try {
      await api.put('/sellers/payment-info', bankData);
      setBankData(bankData);
      setEditingBank(false);
      toast.success('Payment details updated successfully');
      fetchSellerData();
    } catch (error) {
      toast.error('Failed to update payment details');
      console.error(error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const maskAccountNumber = (accountNumber) => {
    if (!accountNumber) return '';
    return '****' + accountNumber.slice(-4);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Store Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                  {profile?.storeLogo ? (
                    <img src={profile.storeLogo} alt={profile.businessName} className="w-full h-full object-cover" />
                  ) : (
                    '📦'
                  )}
                </div>
                {editing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
                    <FaCamera />
                    <input type="file" hidden onChange={handleLogoChange} accept="image/*" />
                  </label>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{profile?.businessName}</h1>
                <p className="text-gray-600">{profile?.name || user?.name}</p>
                <p className="text-gray-600">{profile?.email || user?.email}</p>
                <p className="text-gray-600">{profile?.phone || user?.phone || 'No phone added'}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      profile?.storeStatus === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {profile?.storeStatus === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="bg-orange-400 text-white px-6 py-2 rounded-lg hover:bg-orange-500 transition font-semibold flex items-center gap-2"
            >
              <FaEdit /> {editing ? 'Cancel' : 'Edit Store'}
            </button>
          </div>

          {/* Edit Form */}
          {editing && (
            <div className="border-t pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                  <input
                    type="text"
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GST Number (Optional)</label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Status</label>
                  <select
                    name="storeStatus"
                    value={formData.storeStatus}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Description</label>
                <textarea
                  name="storeDescription"
                  value={formData.storeDescription}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400"
                ></textarea>
              </div>
              <button
                onClick={handleSaveProfile}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Store Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-3xl font-bold text-orange-400">{stats.totalProducts || 0}</p>
            <p className="text-gray-600 font-semibold">Products</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.totalOrders || 0}</p>
            <p className="text-gray-600 font-semibold">Orders</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-3xl font-bold text-green-600">₹{stats.totalRevenue || 0}</p>
            <p className="text-gray-600 font-semibold">Revenue</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <FaStar className="text-orange-400 text-lg" />
              <p className="text-3xl font-bold text-orange-400">{typeof stats.averageRating === 'number' ? stats.averageRating.toFixed(1) : 0}</p>
            </div>
            <p className="text-gray-600 font-semibold">Rating</p>
          </div>
        </div>

        {/* Bank Details Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Payment Information</h2>
            <button
              onClick={() => setEditingBank(!editingBank)}
              className="bg-orange-400 text-white px-4 py-2 rounded-lg hover:bg-orange-500 transition flex items-center gap-2"
            >
              <FaEdit /> {editingBank ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {!editingBank ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-600">Account Number</label>
                <p className="text-lg font-semibold text-gray-900">{maskAccountNumber(bankData.accountNumber)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">IFSC Code</label>
                <p className="text-lg font-semibold text-gray-900">{bankData.ifsc || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Bank Name</label>
                <p className="text-lg font-semibold text-gray-900">{bankData.bankName || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">UPI ID</label>
                <p className="text-lg font-semibold text-gray-900">{bankData.upiId || 'Not provided'}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={bankData.accountNumber}
                    onChange={handleBankChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    name="ifsc"
                    value={bankData.ifsc}
                    onChange={handleBankChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    name="bankName"
                    value={bankData.bankName}
                    onChange={handleBankChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                  <input
                    type="text"
                    name="upiId"
                    value={bankData.upiId}
                    onChange={handleBankChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveBankDetails}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
              >
                Save Payment Details
              </button>
            </div>
          )}
        </div>

        {/* Account Settings Link */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Account Settings</h2>
          <button
            onClick={() => navigate('/settings')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Go to Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;
