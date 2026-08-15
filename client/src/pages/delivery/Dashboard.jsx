import { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import Spinner from '../../components/Spinner';

const DeliveryDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const watchIdRef = useRef(null);
  const ordersRef = useRef([]);

  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/delivery/orders');
      setOrders(data);
    } catch (error) {
      toast.error('Failed to load assigned orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    return () => stopSharing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pushLocation = (lat, lng) => {
    ordersRef.current.forEach((order) => {
      api.post(`/delivery/orders/${order._id}/location`, { lat, lng }).catch(() => {});
    });
  };

  const startSharing = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    if (orders.length === 0) {
      toast.info('No active deliveries assigned right now');
      return;
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        pushLocation(position.coords.latitude, position.coords.longitude);
      },
      () => toast.error('Unable to access your location'),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
    setSharing(true);
    toast.success('Sharing your live location with customers');
  };

  const stopSharing = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setSharing(false);
  };

  const markDelivered = async (orderId) => {
    try {
      await api.put(`/delivery/orders/${orderId}/deliver`);
      toast.success('Order marked as delivered');
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">My Deliveries</h2>
        <button
          onClick={sharing ? stopSharing : startSharing}
          className={`px-4 py-2 rounded-md font-semibold text-white ${sharing ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {sharing ? 'Stop Sharing Location' : 'Start Sharing Location'}
        </button>
      </div>

      {orders.length === 0 ? (
        <p className="text-gray-500">No orders assigned to you right now.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="border rounded-lg p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
              <div>
                <p className="text-sm text-gray-400">Order #{order._id.slice(-6)}</p>
                <p className="font-semibold">{order.customer?.name} • {order.customer?.phone}</p>
                <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
              </div>
              <button
                onClick={() => markDelivered(order._id)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold whitespace-nowrap"
              >
                Mark Delivered
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard;
