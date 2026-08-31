import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { 
  FaBox, FaShoppingBag, FaCheckCircle, 
  FaRupeeSign, FaStar, FaWallet,
  FaPlus, FaList, FaMoneyCheckAlt
} from 'react-icons/fa';

const Dashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    activeOrders: 0,
    completedOrders: 0,
    revenue: 0,
    rating: 0,
    pendingPayouts: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: prods } = await api.get('/products', { params: { limit: 1000 } });
        const { data: ords } = await api.get('/orders/seller');
        const myProducts = (prods.products || []).filter(p => (p.sellerId?._id || p.sellerId) === user?._id);

        let rev = 0;
        let active = 0;
        let completed = 0;
        let pendingPay = 0;

        ords.forEach(o => {
          if (o.orderStatus === 'delivered') {
            completed++;
            rev += o.totalPrice || o.totalAmount || 0;
          } else if (o.orderStatus !== 'cancelled') {
            active++;
            pendingPay += o.totalPrice || o.totalAmount || 0;
          }
        });

        let totalRating = 0;
        let ratingCount = 0;
        myProducts.forEach(p => {
          if (p.rating) {
            totalRating += p.rating;
            ratingCount++;
          }
        });
        const avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : '4.5';

        setStats({
          products: myProducts.length,
          activeOrders: active,
          completedOrders: completed,
          revenue: rev,
          rating: avgRating,
          pendingPayouts: pendingPay
        });

        setRecentOrders(ords.slice(0, 5));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const getStatusBadgeVariant = (status) => {
    if (status === 'delivered') return 'success';
    if (status === 'shipped') return 'info';
    if (status === 'placed') return 'warning';
    return 'neutral';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <div className="flex items-center gap-3">
          <Link to="/seller/products/add">
            <Button icon={<FaPlus />} variant="primary">
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
             <Skeleton key={i} variant="rectangular" className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Total Products" value={stats.products} icon={FaBox} color="primary" />
          <StatCard title="Active Orders" value={stats.activeOrders} icon={FaShoppingBag} color="warning" />
          <StatCard title="Completed Orders" value={stats.completedOrders} icon={FaCheckCircle} color="success" />
          <StatCard title="Revenue This Month" value={`₹${stats.revenue.toFixed(2)}`} icon={FaRupeeSign} color="info" />
          <StatCard title="Average Rating" value={stats.rating} icon={FaStar} color="purple" />
          <StatCard title="Pending Payouts" value={`₹${stats.pendingPayouts.toFixed(2)}`} icon={FaWallet} color="danger" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Recent Orders</h2>
              <Link to="/seller/orders" className="text-sm font-medium text-orange-500 hover:text-orange-600">
                View All
              </Link>
            </div>
            
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} variant="rectangular" className="h-12 w-full" />
                ))}
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-medium">Order ID</th>
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentOrders.map(order => (
                      <tr key={order._id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">#{order._id.slice(-8)}</td>
                        <td className="px-4 py-3 text-slate-700">{order.userId?.name || 'Customer'}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">₹{(order.totalPrice || order.totalAmount || 0).toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={getStatusBadgeVariant(order.orderStatus)}>
                            {order.orderStatus}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500">No recent orders.</div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="h-full bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
            <div className="flex flex-col gap-3">
              <Link to="/seller/products/add" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-orange-500 hover:shadow-sm transition-all group">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <FaPlus />
                </div>
                <div className="font-medium text-slate-800">Add New Product</div>
              </Link>
              <Link to="/seller/orders" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-orange-500 hover:shadow-sm transition-all group">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <FaList />
                </div>
                <div className="font-medium text-slate-800">View All Orders</div>
              </Link>
              <Link to="/seller/payouts" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-orange-500 hover:shadow-sm transition-all group">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <FaMoneyCheckAlt />
                </div>
                <div className="font-medium text-slate-800">Check Payouts</div>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
