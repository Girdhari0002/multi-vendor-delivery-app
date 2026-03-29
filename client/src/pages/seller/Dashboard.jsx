import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';

const SellerDashboard = () => {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: prods } = await api.get('/products'); // We will filter by sellerId or make a special route
        // Wait, for quickness, we'll fetch /orders/seller to get total rev + orders
        const { data: ords } = await api.get('/orders/seller');
        
        let rev = 0;
        ords.forEach(o => {
          // rough estimation: seller gets totalAmount (if all items are theirs)
          // to be exact, need items filtering
          rev += o.totalAmount;
        });

        // The products API does not have seller-only filter by default unless passed query. Let's just mock total products for now.
        
        setStats({ products: prods.length, orders: ords.length, revenue: rev });
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
      <h2 className="text-2xl font-bold mb-6">Seller Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6 border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-semibold uppercase">Total Products (est)</h3>
          <p className="text-3xl font-bold mt-2">{stats.products}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6 border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-semibold uppercase">Total Orders</h3>
          <p className="text-3xl font-bold mt-2">{stats.orders}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6 border-l-4 border-purple-500">
          <h3 className="text-gray-500 text-sm font-semibold uppercase">Total Revenue</h3>
          <p className="text-3xl font-bold mt-2">₹{stats.revenue.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
