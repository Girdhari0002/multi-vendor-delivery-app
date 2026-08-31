import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { FaUsers, FaShoppingCart, FaBox, FaCog, FaStore, FaTicketAlt, FaListUl, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';

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

  const quickAccessLinks = [
    { label: 'Manage Users', icon: <FaUsers size={20} />, path: '/admin/users', color: 'bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300' },
    { label: 'Manage Sellers', icon: <FaStore size={20} />, path: '/admin/sellers', color: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-300' },
    { label: 'All Orders', icon: <FaListUl size={20} />, path: '/admin/orders', color: 'bg-purple-50 text-purple-600 border-purple-100 hover:border-purple-300' },
    { label: 'All Products', icon: <FaBox size={20} />, path: '/admin/products', color: 'bg-orange-50 text-orange-600 border-orange-100 hover:border-orange-300' },
    { label: 'Coupons', icon: <FaTicketAlt size={20} />, path: '/admin/coupons', color: 'bg-pink-50 text-pink-600 border-pink-100 hover:border-pink-300' },
    { label: 'Platform Settings', icon: <FaCog size={20} />, path: '/settings', color: 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400' },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 animate-pulse">
        <div className="h-48 bg-slate-200 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  const lastLoginTime = profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'Just now';
  const memberSince = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown';

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
      
      {/* Hero Profile Card */}
      <Card className="relative overflow-hidden" padding="lg">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-orange-400 to-orange-500"></div>
        
        <div className="relative pt-6 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          <div className="ring-4 ring-white rounded-full bg-white">
            <Avatar 
              src={profile?.profilePicture} 
              name={profile?.name || 'Admin'} 
              size="xl" 
              className="w-24 h-24 text-3xl shadow-sm"
            />
          </div>
          
          <div className="flex-1 mt-2">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900">{profile?.name}</h1>
              <Badge variant="primary" className="self-center md:self-auto">Super Admin</Badge>
            </div>
            <p className="text-slate-500 mb-6">{profile?.email}</p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm text-slate-600 mb-6">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-slate-400" />
                <span>Member since: <span className="font-medium text-slate-800">{memberSince}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Last login: <span className="font-medium text-slate-800">{lastLoginTime}</span></span>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <Button onClick={() => navigate('/admin/settings')} variant="primary">
                Edit Profile
              </Button>
              <Button onClick={() => navigate('/admin/settings')} variant="outline">
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Platform Statistics */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Platform Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard 
            title="Total Customers" 
            value={platformStats.totalCustomers || 0} 
            icon={FaUsers} 
            color="info" 
          />
          <StatCard 
            title="Total Sellers" 
            value={platformStats.totalSellers || 0} 
            icon={FaStore} 
            color="success" 
          />
          <StatCard 
            title="Total Products" 
            value={platformStats.totalProducts || 0} 
            icon={FaBox} 
            color="purple" 
          />
          <StatCard 
            title="Orders Today" 
            value={platformStats.totalOrdersToday || 0} 
            icon={FaShoppingCart} 
            color="primary" 
          />
          <StatCard 
            title="Total Revenue" 
            value={`₹${(platformStats.totalRevenue || 0).toLocaleString()}`} 
            icon={FaShoppingCart} 
            color="warning" 
          />
          <StatCard 
            title="Pending Orders" 
            value={platformStats.pendingOrders || 0} 
            icon={FaListUl} 
            color="danger" 
          />
        </div>
      </div>

      {/* Quick Access */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickAccessLinks.map((link, idx) => (
            <button
              key={idx}
              onClick={() => navigate(link.path)}
              className={`flex flex-col items-center justify-center p-6 gap-3 rounded-xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${link.color}`}
            >
              {link.icon}
              <span className="text-sm font-semibold text-center leading-tight">{link.label}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AdminProfile;
