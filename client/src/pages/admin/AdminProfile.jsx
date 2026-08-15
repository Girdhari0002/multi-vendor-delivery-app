import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { FaUsers, FaShoppingCart, FaBox, FaCog, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AdminProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [platformStats, setPlatformStats] = useState({
    totalCustomers: 0,
    totalSellers: 0,
    totalProducts: 0,
    totalOrdersToday: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchAdminData();
  }, [user, navigate]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [profileRes, statsRes] = await Promise.all([
        api.get('/users/profile'),
        api.get('/admin/platform-stats'),
      ]);

      setProfile(profileRes.data);
      setPlatformStats(statsRes.data || {});
    } catch (error) {
      toast.error('Failed to load admin data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'A';
  };

  const lastLoginTime = new Date(profile?.lastLogin).toLocaleString() || 'Unknown';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Admin Info Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-28 h-28 rounded-full bg-orange-400 flex items-center justify-center text-white text-5xl font-bold">
                {profile?.profilePicture ? (
                  <img src={profile.profilePicture} alt={profile.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(profile?.name)
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{profile?.name}</h1>
                <p className="text-gray-600">{profile?.email}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="bg-purple-100 text-purple-800 px-4 py-1 rounded-full text-sm font-semibold">
                    Super Admin
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-600 font-semibold">Last Login</label>
                <p className="text-lg text-gray-900 mt-1">{lastLoginTime}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-semibold">Admin Since</label>
                <p className="text-lg text-gray-900 mt-1">{new Date(profile?.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={() => navigate('/settings')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Edit Profile
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="bg-gray-300 text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-400 transition font-semibold"
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Platform Statistics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Customers */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-6 border-l-4 border-blue-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Total Customers</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{platformStats.totalCustomers || 0}</p>
                </div>
                <FaUsers className="text-4xl text-blue-600 opacity-30" />
              </div>
            </div>

            {/* Total Sellers */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-6 border-l-4 border-green-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Total Sellers</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{platformStats.totalSellers || 0}</p>
                </div>
                <FaShoppingCart className="text-4xl text-green-600 opacity-30" />
              </div>
            </div>

            {/* Total Products */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-md p-6 border-l-4 border-purple-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Total Products</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{platformStats.totalProducts || 0}</p>
                </div>
                <FaBox className="text-4xl text-purple-600 opacity-30" />
              </div>
            </div>

            {/* Orders Today */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-md p-6 border-l-4 border-orange-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Orders Today</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{platformStats.totalOrdersToday || 0}</p>
                </div>
                <FaShoppingCart className="text-4xl text-orange-600 opacity-30" />
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-md p-6 border-l-4 border-red-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">₹{platformStats.totalRevenue || 0}</p>
                </div>
                <FaEye className="text-4xl text-red-600 opacity-30" />
              </div>
            </div>

            {/* Pending Orders */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-md p-6 border-l-4 border-yellow-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Pending Orders</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{platformStats.pendingOrders || 0}</p>
                </div>
                <FaShoppingCart className="text-4xl text-yellow-600 opacity-30" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Panel */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/admin/users')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-lg hover:shadow-lg transition font-semibold flex items-center justify-between group"
            >
              <span>Manage Customers</span>
              <FaUsers className="group-hover:translate-x-1 transition" />
            </button>

            <button
              onClick={() => navigate('/admin/sellers')}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-lg hover:shadow-lg transition font-semibold flex items-center justify-between group"
            >
              <span>Manage Sellers</span>
              <FaShoppingCart className="group-hover:translate-x-1 transition" />
            </button>

            <button
              onClick={() => navigate('/admin/orders')}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 px-6 rounded-lg hover:shadow-lg transition font-semibold flex items-center justify-between group"
            >
              <span>All Orders</span>
              <FaBox className="group-hover:translate-x-1 transition" />
            </button>

            <button
              onClick={() => navigate('/admin/products')}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-6 rounded-lg hover:shadow-lg transition font-semibold flex items-center justify-between group"
            >
              <span>All Products</span>
              <FaBox className="group-hover:translate-x-1 transition" />
            </button>

            <button
              onClick={() => navigate('/admin/analytics')}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-lg hover:shadow-lg transition font-semibold flex items-center justify-between group"
            >
              <span>Analytics</span>
              <FaEye className="group-hover:translate-x-1 transition" />
            </button>

            <button
              onClick={() => navigate('/settings')}
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white py-4 px-6 rounded-lg hover:shadow-lg transition font-semibold flex items-center justify-between group"
            >
              <span>Platform Settings</span>
              <FaCog className="group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
