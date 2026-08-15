import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { FaCamera, FaPlus, FaEdit, FaTrash, FaHome, FaBriefcase } from 'react-icons/fa';
import { toast } from 'react-toastify';

const CustomerProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    profilePicture: '',
  });
  const [showAddressModal, setShowAddressModal] = useState(false);
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
        api.get('/orders/my-orders'),
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
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await api.put('/users/profile', formData);
      setProfile(formData);
      setEditing(false);
      toast.success('Profile updated successfully');
      fetchProfileData();
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    }
  };

  const handleAddresChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveAddress = async () => {
    try {
      if (editingAddressId) {
        await api.put(`/users/addresses/${editingAddressId}`, addressForm);
        toast.success('Address updated successfully');
      } else {
        await api.post('/users/addresses', addressForm);
        toast.success('Address added successfully');
      }
      setShowAddressModal(false);
      setEditing(false);
      setEditingAddressId(null);
      resetAddressForm();
      fetchProfileData();
    } catch (error) {
      toast.error('Failed to save address');
      console.error(error);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await api.delete(`/users/addresses/${id}`);
        toast.success('Address deleted successfully');
        fetchProfileData();
      } catch (error) {
        toast.error('Failed to delete address');
        console.error(error);
      }
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
    return <div className="text-center py-12">Loading...</div>;
  }

  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.orderStatus === 'placed' || o.orderStatus === 'shipped').length,
    delivered: orders.filter((o) => o.orderStatus === 'delivered').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-orange-400 flex items-center justify-center text-white text-3xl font-bold">
                  {profile?.profilePicture ? (
                    <img src={profile.profilePicture} alt={profile.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    profile?.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                {editing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
                    <FaCamera />
                    <input type="file" hidden onChange={handleProfilePictureChange} accept="image/*" />
                  </label>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{profile?.name}</h1>
                <p className="text-gray-600">{profile?.email}</p>
                <p className="text-gray-600">{profile?.phone || 'No phone added'}</p>
                <p className="text-xs text-gray-500 mt-2">Member since {new Date(profile?.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="bg-orange-400 text-white px-6 py-2 rounded-lg hover:bg-orange-500 transition font-semibold"
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {/* Edit Form */}
          {editing && (
            <div className="border-t pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
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

        {/* Order Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-3xl font-bold text-orange-400">{orderStats.total}</p>
            <p className="text-gray-600 font-semibold">Total Orders</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{orderStats.pending}</p>
            <p className="text-gray-600 font-semibold">Pending</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-3xl font-bold text-green-600">{orderStats.delivered}</p>
            <p className="text-gray-600 font-semibold">Delivered</p>
          </div>
        </div>

        {/* My Addresses Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Addresses</h2>
            <button
              onClick={() => {
                resetAddressForm();
                setEditingAddressId(null);
                setShowAddressModal(true);
              }}
              className="bg-orange-400 text-white px-4 py-2 rounded-lg hover:bg-orange-500 transition flex items-center gap-2"
            >
              <FaPlus /> Add Address
            </button>
          </div>

          {addresses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map((address) => (
                <div key={address._id} className="border border-gray-300 rounded-lg p-4 relative">
                  {address.isDefault && (
                    <span className="absolute top-2 right-2 bg-orange-400 text-white text-xs px-2 py-1 rounded-full">
                      Default
                    </span>
                  )}
                  <div className="flex items-start gap-3 mb-3">
                    {address.label === 'Work' ? <FaBriefcase className="text-orange-400 mt-1" /> : <FaHome className="text-orange-400 mt-1" />}
                    <h3 className="font-bold text-gray-900">{address.label}</h3>
                  </div>
                  <p className="text-gray-700 text-sm mb-1">{address.street}</p>
                  <p className="text-gray-700 text-sm mb-1">
                    {address.city}, {address.state} - {address.zip}
                  </p>
                  <p className="text-gray-700 text-sm mb-4">{address.country}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditAddress(address)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address._id)}
                      className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No addresses added yet</p>
          )}
        </div>

        {/* Address Modal */}
        {showAddressModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-96 max-h-96 overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">{editingAddressId ? 'Edit Address' : 'Add New Address'}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Label</label>
                  <select
                    name="label"
                    value={addressForm.label}
                    onChange={handleAddresChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Street Address</label>
                  <input
                    type="text"
                    name="street"
                    value={addressForm.street}
                    onChange={handleAddresChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={addressForm.city}
                      onChange={handleAddresChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={addressForm.state}
                      onChange={handleAddresChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">ZIP Code</label>
                    <input
                      type="text"
                      name="zip"
                      value={addressForm.zip}
                      onChange={handleAddresChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={addressForm.country}
                      onChange={handleAddresChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={addressForm.isDefault}
                    onChange={handleAddresChange}
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-medium">Set as default address</label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveAddress}
                  className="flex-1 bg-orange-400 text-white py-2 rounded-lg hover:bg-orange-500 transition font-semibold"
                >
                  {editingAddressId ? 'Update' : 'Add'}
                </button>
                <button
                  onClick={() => {
                    setShowAddressModal(false);
                    resetAddressForm();
                  }}
                  className="flex-1 bg-gray-300 text-gray-900 py-2 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerProfile;
