import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Spinner from '../../components/Spinner';
import { getSocket } from '../../api/socket';
import LiveTrackingMap from '../../components/LiveTrackingMap';

const TrackingUI = ({ order }) => {
  const status = order.orderStatus;
  const steps = [
    { label: 'placed', date: order.createdAt },
    { label: 'shipped', date: order.shippedAt },
    { label: 'delivered', date: order.deliveredAt }
  ];
  
  const statusList = steps.map(s => s.label);
  const currentIndex = statusList.indexOf(status);

  if (currentIndex === -1) return null;

  return (
    <div className="w-full py-6">
      <div className="relative flex justify-between items-start w-full">
        {/* Background Track */}
        <div className="absolute left-[16%] right-[16%] top-4 h-1 bg-gray-200"></div>
        {/* Progress Track */}
        <div 
          className="absolute left-[16%] top-4 h-1 bg-green-500 transition-all duration-500"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 68}%` }}
        ></div>

        {steps.map((step, index) => {
          const isCompleted = currentIndex >= index;
          return (
            <div key={step.label} className="flex flex-col items-center relative z-10 w-1/3">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center 
                ${isCompleted ? 'bg-green-500 text-white shadow-md' : 'bg-gray-200 text-gray-500'} text-xs font-bold transition-colors duration-300`}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <div className={`text-[10px] sm:text-xs mt-2 font-semibold uppercase text-center w-full ${isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                {step.label}
              </div>
              {isCompleted && step.date && (
                <div className="text-[9px] sm:text-[10px] text-gray-500 mt-1 text-center font-medium">
                  {new Date(step.date).toLocaleDateString()} {new Date(step.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/user');
        setOrders(data);
      } catch (error) {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();

    // Socket.io Setup for Real-Time Order Updates
    const socket = getSocket();

    const handleConnect = () => {
      if (user?._id) {
        socket.emit('join_room', user._id.toString());
      }
    };
    const handleStatusUpdate = (data) => {
      toast.info(`Order #${data.orderId.slice(-6)} is now ${data.status}`);
      setOrders(prev =>
        prev.map(o =>
          o._id === data.orderId ? { ...o, orderStatus: data.status } : o
        )
      );
    };

    socket.on('connect', handleConnect);
    socket.on('orderStatusUpdated', handleStatusUpdate);
    if (socket.connected) handleConnect();

    return () => {
      socket.off('connect', handleConnect);
      socket.off('orderStatusUpdated', handleStatusUpdate);
    };
  }, [user]);

  if (loading) return <Spinner />;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">My Orders</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500">You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order._id} className="border rounded-lg p-6 flex flex-col hover:shadow-md transition">
              <div className="flex flex-col md:flex-row justify-between w-full">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Order ID: {order._id}</p>
                  <div className="space-y-2 mb-4">
                    {order.items.map(item => (
                      <div key={item.productId?._id} className="flex space-x-4 text-gray-800">
                        <span className="font-semibold">{item.quantity} x</span>
                        <span>{item.productId?.title || 'Unknown Product'}</span>
                      </div>
                    ))}
                  </div>
                  <p className="font-bold text-lg text-blue-600">Total: ₹{order.totalPrice || order.totalAmount || 0}</p>
                  <p className="text-sm mt-2"><span className="font-semibold text-gray-600">Delivering to:</span> {order.deliveryAddress}</p>
                </div>
                <div className="mt-4 md:mt-0 flex flex-col justify-between items-end">
                  <span className={`px-4 py-1 text-sm font-bold uppercase rounded-full ${order.orderStatus === 'failed' ? 'bg-red-100 text-red-700' : order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' : order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {order.orderStatus === 'failed' ? 'Transaction Failed' : order.orderStatus}
                  </span>
                  <span className="text-xs text-gray-400 mt-2">{new Date(order.createdAt).toLocaleString()}</span>
                </div>
              </div>
              
              {order.orderStatus !== 'failed' && (
                <div className="mt-6 border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Delivery Status</h4>
                  <TrackingUI order={order} />
                </div>
              )}

              {order.orderStatus === 'shipped' && order.deliveryAgentId && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Live Location</h4>
                  <LiveTrackingMap orderId={order._id} initialLocation={order.currentLocation} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
