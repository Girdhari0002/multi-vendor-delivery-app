import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { FaCamera, FaEdit, FaStar, FaBox, FaShoppingCart, FaRupeeSign, FaUniversity, FaStore, FaCog } from 'react-icons/fa';
import { toast } from 'react-toastify';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

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
  
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    gstNumber: '',
    storeDescription: '',
    storeLogo: '',
    storeStatus: 'active',
    phone: '',
    storeAddress: { street: '', city: '', state: '', zip: '', country: 'India' },
  });
  const [bankData, setBankData] = useState({
    accountNumber: '',
    ifsc: '',
    bankName: '',
    upiId: '',
  });

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
        phone: profileRes.data.phone || '',
        storeAddress: {
          street: profileRes.data.storeAddress?.street || '',
          city: profileRes.data.storeAddress?.city || '',
          state: profileRes.data.storeAddress?.state || '',
          zip: profileRes.data.storeAddress?.zip || '',
          country: profileRes.data.storeAddress?.country || 'India',
        },
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

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, storeAddress: { ...prev.storeAddress, [name]: value } }));
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
      setSaving(true);
      await api.put('/sellers/profile', formData);
      setProfile((prev) => ({ ...prev, ...formData }));
      setIsStoreModalOpen(false);
      toast.success('Store profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBankDetails = async () => {
    try {
      setSaving(true);
      await api.put('/sellers/payment-info', bankData);
      setProfile((prev) => ({ ...prev, bankDetails: { ...bankData } }));
      setIsBankModalOpen(false);
      toast.success('Payment details updated successfully');
    } catch (error) {
      toast.error('Failed to update payment details');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const maskAccountNumber = (accountNumber) => {
    if (!accountNumber) return 'Not provided';
    return '****' + accountNumber.slice(-4);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Hero Section */}
        <Card className="relative overflow-hidden bg-white">
          <div className="h-32 bg-gradient-to-r from-orange-400 to-orange-600"></div>
          <div className="px-8 pb-8 pt-0 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-12 md:-mt-16">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                <div className="relative group">
                  <Avatar 
                    src={profile?.storeLogo || formData.storeLogo} 
                    name={profile?.businessName || user?.name} 
                    className="w-32 h-32 border-4 border-white shadow-md text-4xl"
                  />
                  <label className="absolute bottom-1 right-1 bg-slate-900 text-white p-2.5 rounded-full cursor-pointer hover:bg-slate-800 shadow-lg transition-transform hover:scale-105 z-10">
                    <FaCamera size={16} />
                    <input type="file" hidden onChange={handleLogoChange} accept="image/*" />
                  </label>
                </div>
                <div className="pb-2">
                  <h1 className="text-3xl font-bold text-slate-900 mb-1">{profile?.businessName || 'Your Store Name'}</h1>
                  <p className="text-slate-500 font-medium mb-3">{profile?.name || user?.name} • {profile?.email || user?.email}</p>
                  <Badge variant={profile?.storeStatus === 'active' ? 'success' : 'danger'} dot>
                    {profile?.storeStatus === 'active' ? 'Active Store' : 'Inactive Store'}
                  </Badge>
                </div>
              </div>
              <div className="pb-2 flex justify-center">
                <Button 
                  variant="primary" 
                  icon={<FaEdit />} 
                  onClick={() => setIsStoreModalOpen(true)}
                >
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Products"
            value={stats.totalProducts || 0}
            icon={FaBox}
            color="primary"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders || 0}
            icon={FaShoppingCart}
            color="info"
          />
          <StatCard
            title="Total Revenue"
            value={`₹${stats.totalRevenue || 0}`}
            icon={FaRupeeSign}
            color="success"
          />
          <StatCard
            title="Average Rating"
            value={typeof stats.averageRating === 'number' ? stats.averageRating.toFixed(1) : '0.0'}
            icon={FaStar}
            color="warning"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Store Information */}
            <Card padding="lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FaStore className="text-slate-400" /> Store Details
                </h2>
                <Button variant="ghost" size="sm" icon={<FaEdit />} onClick={() => setIsStoreModalOpen(true)}>
                  Edit
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Business Name</p>
                  <p className="text-slate-900 font-semibold">{profile?.businessName || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Business Type</p>
                  <p className="text-slate-900 font-semibold">{profile?.businessType || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">GST Number</p>
                  <p className="text-slate-900 font-semibold uppercase">{profile?.gstNumber || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Contact Phone</p>
                  <p className="text-slate-900 font-semibold">{profile?.phone || user?.phone || '—'}</p>
                </div>
                <div className="sm:col-span-2 pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500 font-medium mb-2">Store Description</p>
                  <p className="text-slate-700 leading-relaxed">
                    {profile?.storeDescription || 'No description provided.'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Bank Details */}
            <Card padding="lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FaUniversity className="text-slate-400" /> Bank & Payment Info
                </h2>
                <Button variant="ghost" size="sm" icon={<FaEdit />} onClick={() => setIsBankModalOpen(true)}>
                  Edit
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Account Number</p>
                  <p className="text-slate-900 font-semibold font-mono tracking-wider">{maskAccountNumber(bankData.accountNumber)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">IFSC Code</p>
                  <p className="text-slate-900 font-semibold uppercase">{bankData.ifsc || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Bank Name</p>
                  <p className="text-slate-900 font-semibold">{bankData.bankName || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">UPI ID</p>
                  <p className="text-slate-900 font-semibold">{bankData.upiId || '—'}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar / Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            <Card padding="md">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  fullWidth 
                  icon={<FaBox />} 
                  className="justify-start"
                  onClick={() => navigate('/seller/products')}
                >
                  Manage Products
                </Button>
                <Button 
                  variant="outline" 
                  fullWidth 
                  icon={<FaShoppingCart />} 
                  className="justify-start"
                  onClick={() => navigate('/seller/orders')}
                >
                  View Orders
                </Button>
                <Button 
                  variant="outline" 
                  fullWidth 
                  icon={<FaCog />} 
                  className="justify-start"
                  onClick={() => navigate('/seller/settings')}
                >
                  Account Settings
                </Button>
              </div>
            </Card>
            
            <Card className="bg-orange-50 border-orange-100" padding="md">
              <h3 className="text-orange-800 font-bold mb-2">Need Help?</h3>
              <p className="text-orange-700 text-sm mb-4">
                Check out our seller guidelines or contact support for assistance with your store.
              </p>
              <Button variant="primary" size="sm" fullWidth>Contact Support</Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Store Modal */}
      <Modal
        isOpen={isStoreModalOpen}
        onClose={() => !saving && setIsStoreModalOpen(false)}
        title="Edit Store Profile"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Business Name"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              placeholder="e.g. My Super Store"
            />
            <Input
              label="Business Type"
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              placeholder="e.g. Electronics, Clothing"
            />
            <Input
              label="GST Number"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleChange}
              placeholder="Optional"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-800">Store Status</label>
              <select
                name="storeStatus"
                value={formData.storeStatus}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-800">Store Description</label>
            <textarea
              name="storeDescription"
              value={formData.storeDescription}
              onChange={handleChange}
              rows="4"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors resize-none"
              placeholder="Describe your store..."
            ></textarea>
          </div>

          <div className="pt-2">
            <h3 className="text-sm font-semibold text-slate-800 mb-1">Pickup Contact & Address</h3>
            <p className="text-xs text-slate-500 mb-3">Used by the courier partner to reach you and collect packages for shipping.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Contact Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                className="md:col-span-2"
              />
              <Input
                label="Street Address"
                name="street"
                value={formData.storeAddress.street}
                onChange={handleAddressChange}
                placeholder="e.g. 123 Market Street"
                className="md:col-span-2"
              />
              <Input
                label="City"
                name="city"
                value={formData.storeAddress.city}
                onChange={handleAddressChange}
                placeholder="e.g. Mumbai"
              />
              <Input
                label="State"
                name="state"
                value={formData.storeAddress.state}
                onChange={handleAddressChange}
                placeholder="e.g. Maharashtra"
              />
              <Input
                label="PIN Code"
                name="zip"
                value={formData.storeAddress.zip}
                onChange={handleAddressChange}
                placeholder="e.g. 400001"
              />
              <Input
                label="Country"
                name="country"
                value={formData.storeAddress.country}
                onChange={handleAddressChange}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setIsStoreModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveProfile} loading={saving}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Bank Details Modal */}
      <Modal
        isOpen={isBankModalOpen}
        onClose={() => !saving && setIsBankModalOpen(false)}
        title="Edit Payment Information"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Account Number"
            name="accountNumber"
            value={bankData.accountNumber}
            onChange={handleBankChange}
            placeholder="Enter bank account number"
          />
          <Input
            label="IFSC Code"
            name="ifsc"
            value={bankData.ifsc}
            onChange={handleBankChange}
            placeholder="e.g. HDFC0001234"
          />
          <Input
            label="Bank Name"
            name="bankName"
            value={bankData.bankName}
            onChange={handleBankChange}
            placeholder="e.g. HDFC Bank"
          />
          <Input
            label="UPI ID"
            name="upiId"
            value={bankData.upiId}
            onChange={handleBankChange}
            placeholder="e.g. storename@upi"
          />
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setIsBankModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveBankDetails} loading={saving}>Save Details</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default SellerProfile;
