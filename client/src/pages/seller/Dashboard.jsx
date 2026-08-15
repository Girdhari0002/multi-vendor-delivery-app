import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';

const SellerDashboard = () => {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: prods } = await api.get('/products', { params: { limit: 1000 } });
        const { data: ords } = await api.get('/orders/seller');

        let rev = 0;
        ords.forEach(o => {
          rev += o.totalPrice || o.totalAmount || 0;
        });

        setStats({ products: prods.products?.length || 0, orders: ords.length, revenue: rev });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 md:mb-6">Seller Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
        <div className="bg-white shadow rounded-lg p-3 md:p-6 border-l-4 border-blue-500 hover:shadow-lg transition">
          <h3 className="text-gray-500 text-xs md:text-sm font-semibold uppercase">Total Products (est)</h3>
          <p className="text-2xl md:text-3xl font-bold mt-2 text-gray-900">{stats.products}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-3 md:p-6 border-l-4 border-green-500 hover:shadow-lg transition">
          <h3 className="text-gray-500 text-xs md:text-sm font-semibold uppercase">Total Orders</h3>
          <p className="text-2xl md:text-3xl font-bold mt-2 text-gray-900">{stats.orders}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-3 md:p-6 border-l-4 border-purple-500 hover:shadow-lg transition">
          <h3 className="text-gray-500 text-xs md:text-sm font-semibold uppercase">Total Revenue</h3>
          <p className="text-2xl md:text-3xl font-bold mt-2 text-gray-900">₹{stats.revenue.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
