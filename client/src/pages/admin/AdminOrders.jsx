import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import Spinner from '../../components/Spinner';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/admin');
      setOrders(data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const { data } = await api.get('/admin/delivery-agents');
      setAgents(data);
    } catch (error) {
      // Non-critical if this fails to load
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchAgents();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const assignAgent = async (id, agentId) => {
    if (!agentId) return;
    try {
      await api.put(`/orders/${id}/assign-agent`, { agentId });
      toast.success('Delivery agent assigned');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign agent');
    }
  };

  const refundOrder = async (id) => {
    if (!window.confirm('Refund this payment via Razorpay? This cannot be undone.')) return;
    try {
      await api.post(`/payment/refund/${id}`, {});
      toast.success('Refund processed');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Refund failed');
    }
  };

  const canRefund = (order) =>
    order.paymentMethod === 'razorpay' && order.paymentStatus === 'completed' && order.refundStatus !== 'completed';

  const getPaymentStatusColor = (status) => {
    if (status === 'completed') return 'bg-green-100 text-green-800';
    if (status === 'failed') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getOrderStatusColor = (status) => {
    if (status === 'delivered') return 'bg-green-100 text-green-800';
    if (status === 'shipped') return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  if (loading) return <Spinner />;

  return (
    <div className="bg-white shadow rounded-lg p-2 sm:p-4 md:p-6">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 md:mb-6">All Orders</h2>

      {orders.length === 0 ? (
        <p className="text-center py-8 text-gray-500 text-sm md:text-base">No orders yet.</p>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
                  <th className="px-4 lg:px-6 py-3">Order ID</th>
                  <th className="px-4 lg:px-6 py-3">Customer</th>
                  <th className="px-4 lg:px-6 py-3">Amount</th>
                  <th className="px-4 lg:px-6 py-3">Payment</th>
                  <th className="px-4 lg:px-6 py-3">Status</th>
                  <th className="px-4 lg:px-6 py-3">Delivery Agent</th>
                  <th className="px-4 lg:px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                      #{order._id?.slice(-8)}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-xs md:text-sm font-semibold text-gray-900">
                      {order.userId?.name || 'Unknown'}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-xs md:text-sm font-bold text-gray-800">
                      ₹{(order.totalPrice || order.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getOrderStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-xs md:text-sm">
                      <select
                        value={order.deliveryAgentId?._id || order.deliveryAgentId || ''}
                        onChange={(e) => assignAgent(order._id, e.target.value)}
                        className="border rounded px-2 py-1 bg-gray-50 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Unassigned</option>
                        {agents.map((agent) => (
                          <option key={agent._id} value={agent._id}>{agent.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        className="border rounded px-2 py-1 bg-gray-50 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="placed">Placed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      {canRefund(order) && (
                        <button
                          onClick={() => refundOrder(order._id)}
                          className="text-xs font-semibold text-red-600 hover:text-red-800 underline"
                        >
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {orders.map(order => (
              <div key={order._id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-semibold">Order ID</p>
                    <p className="text-sm font-bold text-gray-900">#{order._id?.slice(-8)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-semibold">Amount</p>
                    <p className="text-sm font-bold text-gray-900">₹{(order.totalPrice || order.totalAmount || 0).toFixed(2)}</p>
                  </div>
                </div>

                <div className="mb-2 border-t pt-2">
                  <p className="text-xs text-gray-500 font-semibold mb-1">Customer</p>
                  <p className="text-sm font-medium text-gray-900">{order.userId?.name || 'Unknown'}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 border-t pt-2">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1">Payment</p>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1">Status</p>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getOrderStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-2 mb-2">
                  <label className="text-xs text-gray-500 font-semibold mb-1 block">Delivery Agent</label>
                  <select
                    value={order.deliveryAgentId?._id || order.deliveryAgentId || ''}
                    onChange={(e) => assignAgent(order._id, e.target.value)}
                    className="w-full border rounded px-2 py-1 bg-gray-50 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Unassigned</option>
                    {agents.map((agent) => (
                      <option key={agent._id} value={agent._id}>{agent.name}</option>
                    ))}
                  </select>
                </div>

                <div className="border-t pt-2">
                  <label className="text-xs text-gray-500 font-semibold mb-1 block">Update Status</label>
                  <select
                    value={order.orderStatus}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    className="w-full border rounded px-2 py-1 bg-gray-50 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="placed">Placed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  {canRefund(order) && (
                    <button
                      onClick={() => refundOrder(order._id)}
                      className="mt-2 w-full text-xs font-semibold text-red-600 hover:text-red-800 underline"
                    >
                      Refund Payment
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
export default AdminOrders;
