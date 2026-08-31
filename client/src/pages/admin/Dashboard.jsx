import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Skeleton } from '../../components/ui/Skeleton';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { toast } from 'react-toastify';
import {
  FaUsers, FaStore, FaBox, FaShoppingBag, 
  FaMoneyBillWave, FaClock, FaTruck, FaTicketAlt,
  FaChevronRight
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/dashboard');
        setStats(data);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <h2 className="text-2xl font-bold mb-6 text-slate-800">Command Center</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(8)].map((_, i) => <Skeleton key={i} height="120px" variant="rectangular" className="rounded-xl" />)}
        </div>
      </div>
    );
  }

  const quickActions = [
    { label: 'Users', path: '/admin/users', icon: FaUsers, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Sellers', path: '/admin/sellers', icon: FaStore, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Orders', path: '/admin/orders', icon: FaShoppingBag, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Products', path: '/admin/products', icon: FaBox, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Coupons', path: '/admin/coupons', icon: FaTicketAlt, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Payouts', path: '/admin/payouts', icon: FaMoneyBillWave, color: 'text-cyan-500', bg: 'bg-cyan-50' },
  ];

  const recentOrders = stats?.recentOrders || [];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Command Center</h2>
      
      {/* 8 StatCards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={FaUsers} color="primary" />
        <StatCard title="Total Sellers" value={stats?.totalSellers || 0} icon={FaStore} color="info" />
        <StatCard title="Total Products" value={stats?.totalProducts || 0} icon={FaBox} color="warning" />
        <StatCard title="Total Orders" value={stats?.totalOrders || 0} icon={FaShoppingBag} color="success" />
        <StatCard title="Total Revenue" value={`₹${(stats?.totalRevenue || 0).toFixed(2)}`} icon={FaMoneyBillWave} color="purple" />
        <StatCard title="Pending Orders" value={stats?.pendingOrders || 0} icon={FaClock} color="danger" />
        <StatCard title="Delivery Agents" value={stats?.deliveryAgents || 0} icon={FaTruck} color="info" />
        <StatCard title="Active Coupons" value={stats?.activeCoupons || 0} icon={FaTicketAlt} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card padding="none" className="overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="text-lg font-bold text-slate-800">Recent Orders</h3>
              <button onClick={() => navigate('/admin/orders')} className="text-sm font-medium text-orange-500 hover:text-orange-600 flex items-center gap-1">
                View All <FaChevronRight size={12} />
              </button>
            </div>
            <div className="divide-y divide-slate-100 bg-white">
              {recentOrders.length > 0 ? (
                recentOrders.map(order => (
                  <div key={order._id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-semibold text-slate-800">{order.customer?.name || 'Unknown'}</p>
                      <p className="text-sm text-slate-500">Order #{order._id?.slice(-6).toUpperCase()}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="font-bold text-slate-900">₹{(order.totalPrice || 0).toFixed(2)}</p>
                      <Badge 
                        variant={order.orderStatus === 'delivered' ? 'success' : order.orderStatus === 'placed' ? 'warning' : 'primary'}
                      >
                        {order.orderStatus || 'Pending'}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500">No recent orders found</div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions Grid */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, i) => (
              <Card 
                key={i} 
                hover 
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center justify-center p-6 text-center group cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-full ${action.bg} ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon size={24} />
                </div>
                <span className="font-medium text-slate-700">{action.label}</span>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
