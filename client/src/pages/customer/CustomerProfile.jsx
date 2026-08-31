import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { FaCamera, FaPlus, FaEdit, FaTrash, FaHome, FaBriefcase, FaMapMarkerAlt, FaHeart, FaShoppingBag, FaCog } from 'react-icons/fa';
import Avatar from '../../components/ui/Avatar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const CustomerProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Profile edit state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    profilePicture: '',
  });

  // Address edit state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
    isDefault: false,
  });

  // Delete confirm state
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'customer') {
      navigate('/login');
      return;
    }
    fetchProfileData();
  }, [user, navigate]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [profileRes, addressesRes, ordersRes] = await Promise.all([
        api.get('/users/profile'),
        api.get('/users/addresses'),
        api.get('/orders/user').catch(() => ({ data: [] })),
      ]);

      setProfile(profileRes.data);
      setAddresses(addressesRes.data || []);
      setOrders(ordersRes.data || []);

      setFormData({
        name: profileRes.data.name || '',
        email: profileRes.data.email || '',
        phone: profileRes.data.phone || '',
        dateOfBirth: profileRes.data.dateOfBirth || '',
        gender: profileRes.data.gender || '',
        profilePicture: profileRes.data.profilePicture || '',
      });
    } catch (error) {
      toast.error('Failed to load profile data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profilePicture: reader.result }));
        // Also update immediately via API to avoid having to hit save just for photo
        handleDirectPhotoUpload(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDirectPhotoUpload = async (base64String) => {
    try {
      await api.put('/users/profile', { ...formData, profilePicture: base64String });
      setProfile(prev => ({ ...prev, profilePicture: base64String }));
      toast.success('Profile photo updated');
    } catch (error) {
      toast.error('Failed to update profile photo');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setProfileSaving(true);
      await api.put('/users/profile', formData);
      setProfile(formData);
      setShowProfileModal(false);
      toast.success('Profile updated successfully');
      fetchProfileData();
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAddresChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      setAddressSaving(true);
      if (editingAddressId) {
        await api.put(`/users/addresses/${editingAddressId}`, addressForm);
        toast.success('Address updated successfully');
      } else {
        await api.post('/users/addresses', addressForm);
        toast.success('Address added successfully');
      }
      setShowAddressModal(false);
      setEditingAddressId(null);
      fetchProfileData();
    } catch (error) {
      toast.error('Failed to save address');
      console.error(error);
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async () => {
    const id = deleteConfirm.id;
    if (!id) return;
    
    try {
      setDeleting(true);
      await api.delete(`/users/addresses/${id}`);
      toast.success('Address deleted successfully');
      setDeleteConfirm({ isOpen: false, id: null });
      fetchProfileData();
    } catch (error) {
      toast.error('Failed to delete address');
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  const handleEditAddress = (address) => {
    setAddressForm(address);
    setEditingAddressId(address._id);
    setShowAddressModal(true);
  };

  const resetAddressForm = () => {
    setAddressForm({
      label: 'Home',
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'India',
      isDefault: false,
    });
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Loading...</div>;
  }

  const orderStats = {
    total: orders.length,
    spent: orders.reduce((sum, order) => sum + (order.totalPrice || order.totalAmount || 0), 0),
    wishlist: 0 // Mock wishlist items count
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Profile Hero Section */}
      <Card padding="lg" className="relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-orange-400 to-orange-600"></div>
        <div className="relative pt-12 flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="relative group">
            <Avatar 
              src={profile?.profilePicture} 
              name={profile?.name} 
              size="xl" 
              className="ring-4 ring-white shadow-lg"
            />
            <label className="absolute bottom-0 right-0 bg-slate-900 text-white p-2 rounded-full cursor-pointer hover:bg-slate-800 transition-colors shadow-md">
              <FaCamera className="w-4 h-4" />
              <input type="file" hidden onChange={handleProfilePictureChange} accept="image/*" />
            </label>
          </div>
          
          <div className="flex-1 text-center md:text-left mb-2">
            <h1 className="text-3xl font-bold text-slate-900">{profile?.name}</h1>
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 mt-2 text-slate-600">
              <span>{profile?.email}</span>
              <span className="hidden md:inline text-slate-300">•</span>
              <span>{profile?.phone || 'No phone added'}</span>
            </div>
            <p className="text-sm text-slate-500 mt-2">
              Member since {new Date(profile?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="mb-2">
            <Button onClick={() => setShowProfileModal(true)} icon={<FaEdit />} variant="outline">
              Edit Profile
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-3">
              <FaShoppingBag size={20} />
            </div>
            <p className="text-3xl font-bold text-slate-900">{orderStats.total}</p>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mt-1">Total Orders</p>
          </Card>
          <Card className="flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-3">
              <span className="text-xl font-bold">₹</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{orderStats.spent}</p>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mt-1">Total Spent</p>
          </Card>
          <Card className="flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-3">
              <FaHeart size={20} />
            </div>
            <p className="text-3xl font-bold text-slate-900">{orderStats.wishlist}</p>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mt-1">Wishlist Items</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="md:col-span-1 flex flex-col h-full" padding="none">
          <div className="p-4 border-b border-slate-100 font-semibold text-slate-900 uppercase tracking-wider text-sm">
            Quick Actions
          </div>
          <div className="flex-1 p-2 flex flex-col">
            <Link to="/orders" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-medium">
              <FaShoppingBag className="text-orange-500" /> My Orders
            </Link>
            <Link to="/wishlist" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-medium">
              <FaHeart className="text-rose-500" /> My Wishlist
            </Link>
            <Link to="/settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-medium">
              <FaCog className="text-slate-500" /> Settings
            </Link>
          </div>
        </Card>
      </div>

      {/* Address Book Section */}
      <Card>
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <h2 className="text-xl font-bold text-slate-900">Saved Addresses</h2>
          <Button 
            onClick={() => {
              resetAddressForm();
              setEditingAddressId(null);
              setShowAddressModal(true);
            }} 
            icon={<FaPlus />}
          >
            Add New Address
          </Button>
        </div>

        {addresses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <div key={address._id} className="border border-slate-200 rounded-xl p-5 relative hover:border-orange-500 hover:shadow-sm transition-all bg-slate-50">
                <div className="absolute top-4 right-4">
                  {address.isDefault && <Badge variant="primary" size="sm">Default</Badge>}
                </div>
                
                <div className="flex items-start gap-3 mb-3">
                  <div className="mt-1 p-2 bg-white rounded-full text-orange-500 shadow-sm">
                    {address.label === 'Home' ? <FaHome /> : address.label === 'Work' ? <FaBriefcase /> : <FaMapMarkerAlt />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{address.label}</h3>
                    <div className="text-slate-600 text-sm mt-1 leading-relaxed">
                      <p>{address.street}</p>
                      <p>{address.city}, {address.state} - {address.zip}</p>
                      <p>{address.country}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-4 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => handleEditAddress(address)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 transition-colors"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ isOpen: true, id: address._id })}
                    className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1 transition-colors"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            No saved addresses found. Add one to make checkout faster.
          </div>
        )}
      </Card>

      {/* Profile Edit Modal */}
      <Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} title="Edit Profile">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input 
            label="Full Name" 
            name="name" 
            value={formData.name} 
            onChange={handleProfileChange} 
            required 
          />
          <Input 
            label="Email Address" 
            type="email" 
            name="email" 
            value={formData.email} 
            disabled 
            helperText="Email cannot be changed."
          />
          <Input 
            label="Phone Number" 
            type="tel" 
            name="phone" 
            value={formData.phone} 
            onChange={handleProfileChange} 
          />
          <Input 
            label="Date of Birth" 
            type="date" 
            name="dateOfBirth" 
            value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''} 
            onChange={handleProfileChange} 
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-800">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleProfileChange}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setShowProfileModal(false)}>Cancel</Button>
            <Button type="submit" loading={profileSaving}>Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Address Edit Modal */}
      <Modal isOpen={showAddressModal} onClose={() => setShowAddressModal(false)} title={editingAddressId ? 'Edit Address' : 'Add New Address'}>
        <form onSubmit={handleSaveAddress} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-800">Label</label>
            <select
              name="label"
              value={addressForm.label}
              onChange={handleAddresChange}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
            >
              <option value="Home">Home</option>
              <option value="Work">Work</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <Input 
            label="Street Address" 
            name="street" 
            value={addressForm.street} 
            onChange={handleAddresChange} 
            required 
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="City" 
              name="city" 
              value={addressForm.city} 
              onChange={handleAddresChange} 
              required 
            />
            <Input 
              label="State" 
              name="state" 
              value={addressForm.state} 
              onChange={handleAddresChange} 
              required 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="ZIP Code" 
              name="zip" 
              value={addressForm.zip} 
              onChange={handleAddresChange} 
              required 
            />
            <Input 
              label="Country" 
              name="country" 
              value={addressForm.country} 
              onChange={handleAddresChange} 
              required 
            />
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="isDefault"
              name="isDefault"
              checked={addressForm.isDefault}
              onChange={handleAddresChange}
              className="w-4 h-4 text-orange-500 rounded border-slate-300 focus:ring-orange-500"
            />
            <label htmlFor="isDefault" className="text-sm font-medium text-slate-700 cursor-pointer">
              Set as default address
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setShowAddressModal(false)}>Cancel</Button>
            <Button type="submit" loading={addressSaving}>{editingAddressId ? 'Update Address' : 'Add Address'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Address Confirm */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={handleDeleteAddress}
        loading={deleting}
        title="Delete Address"
        message="Are you sure you want to delete this address? This action cannot be undone."
        variant="danger"
        confirmLabel="Yes, Delete"
      />
    </div>
  );
};

export default CustomerProfile;
