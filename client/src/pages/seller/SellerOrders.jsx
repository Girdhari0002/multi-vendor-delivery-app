import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import Spinner from '../../components/Spinner';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/seller');
      setOrders(data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
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

  if (loading) return <Spinner />;

  return (
    <div className="bg-white shadow rounded-lg p-6 relative">
      <h2 className="text-2xl font-bold mb-6">Store Orders</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3">Order ID</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Total Amount</th>
              <th className="px-6 py-3 cursor-pointer">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map(order => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b">
                  <span className="text-xs text-gray-400">#{order._id}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-b">
                   <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' : order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {order.orderStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-b">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800 border-b">₹{order.totalAmount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium border-b flex space-x-2 items-center">
                  <select 
                    value={order.orderStatus} 
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    className="border rounded px-2 py-1 text-gray-700 bg-gray-50 focus:outline-none"
                  >
                    <option value="placed">Placed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                  <button 
                    onClick={() => setSelectedInvoice(order)}
                    className="ml-2 text-indigo-600 hover:text-indigo-900 text-xs border border-indigo-600 rounded px-2 py-1"
                  >
                    Invoice Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <div className="p-8 text-center text-gray-500">No orders for your store yet.</div>}
      </div>

      {/* Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 font-sans">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">Invoice / Order Details</h2>
            
            <div className="flex justify-between mb-6">
              <div>
                <h3 className="font-semibold text-gray-700">Customer Details:</h3>
                <p className="text-gray-600">Name: {selectedInvoice.userId?.name || 'Unknown'}</p>
                <p className="text-gray-600">Email: {selectedInvoice.userId?.email || 'N/A'}</p>
              </div>
              <div className="text-right">
                <h3 className="font-semibold text-gray-700">Order Information:</h3>
                <p className="text-gray-600">Order ID: #{selectedInvoice._id}</p>
                <p className="text-gray-600">Date: {new Date(selectedInvoice.createdAt).toLocaleString()}</p>
                <p className="text-gray-600">Status: {selectedInvoice.orderStatus.toUpperCase()}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Delivery Address:</h3>
              <p className="text-gray-600 bg-gray-50 p-3 rounded border">{selectedInvoice.deliveryAddress}</p>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Items Ordered:</h3>
              <table className="min-w-full border rounded">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 text-left">Item</th>
                    <th className="py-2 px-4 text-center">Qty</th>
                    <th className="py-2 px-4 text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="py-2 px-4">{item.productId?.title || 'Unknown Product'}</td>
                      <td className="py-2 px-4 text-center">{item.quantity}</td>
                      <td className="py-2 px-4 text-right">₹{item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end border-t pt-4">
              <div className="text-right">
                <p className="text-lg font-bold text-indigo-700">Total: ₹{selectedInvoice.totalAmount}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
