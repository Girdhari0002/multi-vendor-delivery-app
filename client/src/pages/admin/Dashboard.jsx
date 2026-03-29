import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/dashboard');
        setStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6 border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-semibold uppercase">Total Users</h3>
          <p className="text-3xl font-bold mt-2">{stats?.totalUsers}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6 border-l-4 border-yellow-500">
          <h3 className="text-gray-500 text-sm font-semibold uppercase">Total Products</h3>
          <p className="text-3xl font-bold mt-2">{stats?.totalProducts}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6 border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-semibold uppercase">Total Orders</h3>
          <p className="text-3xl font-bold mt-2">{stats?.totalOrders}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6 border-l-4 border-purple-500">
          <h3 className="text-gray-500 text-sm font-semibold uppercase">Total Revenue</h3>
          <p className="text-3xl font-bold mt-2">₹{stats?.totalRevenue.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
