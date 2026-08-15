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

  const getOrderStatusColor = (status) => {
    if (status === 'delivered') return 'bg-green-100 text-green-800';
    if (status === 'shipped') return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  if (loading) return <Spinner />;

  return (
    <div className="bg-white shadow rounded-lg p-2 sm:p-4 md:p-6 relative">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 md:mb-6">Store Orders</h2>

      {orders.length === 0 ? (
        <div className="p-6 md:p-8 text-center text-gray-500 text-sm md:text-base">
          No orders for your store yet.
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-4 lg:px-6 py-3">Order ID</th>
                  <th className="px-4 lg:px-6 py-3">Status</th>
                  <th className="px-4 lg:px-6 py-3">Date</th>
                  <th className="px-4 lg:px-6 py-3">Total Amount</th>
                  <th className="px-4 lg:px-6 py-3 cursor-pointer">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b">
                      <span className="text-xs text-gray-400">#{order._id?.slice(-8)}</span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap border-b">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getOrderStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 border-b">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800 border-b">
                      ₹{(order.totalPrice || order.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium border-b flex gap-2 items-center flex-wrap">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        className="border rounded px-2 py-1 text-xs md:text-sm text-gray-700 bg-gray-50 focus:outline-none"
                      >
                        <option value="placed">Placed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                      <button
                        onClick={() => setSelectedInvoice(order)}
                        className="text-indigo-600 hover:text-indigo-900 text-xs border border-indigo-600 rounded px-2 py-1"
                      >
                        Invoice
                      </button>
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
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">Order ID</p>
                    <p className="text-sm font-bold text-gray-900">#{order._id?.slice(-8)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-semibold">Amount</p>
                    <p className="text-sm font-bold text-gray-900">₹{(order.totalPrice || order.totalAmount || 0).toFixed(2)}</p>
                  </div>
                </div>

                <div className="border-t pt-2 mb-2 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 font-semibold">Date</span>
                    <span className="text-xs text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 font-semibold">Status</span>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getOrderStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-2 space-y-2">
                  <label className="text-xs text-gray-500 font-semibold block">Update Status</label>
                  <select
                    value={order.orderStatus}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    className="w-full border rounded px-2 py-1 bg-gray-50 text-xs focus:outline-none"
                  >
                    <option value="placed">Placed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                  <button
                    onClick={() => setSelectedInvoice(order)}
                    className="w-full text-indigo-600 hover:text-indigo-900 border border-indigo-600 rounded px-2 py-2 text-xs font-medium"
                  >
                    View Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Professional Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 font-sans p-2">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl p-4 md:p-8 relative max-h-[95vh] overflow-y-auto">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-2 right-2 md:top-4 md:right-4 text-gray-500 hover:text-gray-800 font-bold text-2xl"
            >
              ×
            </button>

            {/* Invoice Header */}
            <div className="flex flex-col md:flex-row justify-between items-start mb-6 md:mb-8 border-b-2 border-gray-300 pb-4 md:pb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">INVOICE</h1>
                <p className="text-gray-600 text-xs md:text-sm mt-1">Delivery App Store</p>
              </div>
              <div className="text-left md:text-right text-xs md:text-sm mt-4 md:mt-0">
                <p className="text-gray-600"><span className="font-semibold">Invoice #:</span> {selectedInvoice.invoiceNumber || 'INV-' + selectedInvoice._id.slice(-6)}</p>
                <p className="text-gray-600"><span className="font-semibold">Order #:</span> {selectedInvoice._id.slice(-8)}</p>
                <p className="text-gray-600"><span className="font-semibold">Date:</span> {new Date(selectedInvoice.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            {/* Bill To & Ship To */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-8">
              <div>
                <h3 className="text-xs md:text-sm font-bold text-gray-700 uppercase mb-2 md:mb-3 border-b pb-2">Bill To:</h3>
                <p className="font-semibold text-gray-900 text-xs md:text-sm">{selectedInvoice.userId?.name || 'Customer'}</p>
                <p className="text-xs text-gray-600">Phone: {selectedInvoice.userId?.phone || 'N/A'}</p>
                <p className="text-xs text-gray-600">Email: {selectedInvoice.userId?.email || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-xs md:text-sm font-bold text-gray-700 uppercase mb-2 md:mb-3 border-b pb-2">Ship To:</h3>
                <p className="font-semibold text-gray-900 text-xs md:text-sm">{selectedInvoice.userId?.name || 'Customer'}</p>
                <p className="text-xs text-gray-600">Phone: {selectedInvoice.userId?.phone || 'N/A'}</p>
                <p className="text-xs text-gray-600 whitespace-pre-line">{selectedInvoice.deliveryAddress}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6 md:mb-8 overflow-x-auto">
              <table className="w-full border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="border-t-2 border-b-2 border-gray-400 bg-gray-100">
                    <th className="py-2 md:py-3 px-2 md:px-4 text-left font-bold text-gray-700">#</th>
                    <th className="py-2 md:py-3 px-2 md:px-4 text-left font-bold text-gray-700">Product</th>
                    <th className="py-2 md:py-3 px-2 md:px-4 text-center font-bold text-gray-700">Qty</th>
                    <th className="py-2 md:py-3 px-2 md:px-4 text-right font-bold text-gray-700">Price</th>
                    <th className="py-2 md:py-3 px-2 md:px-4 text-right font-bold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-2 md:py-3 px-2 md:px-4 text-gray-600">{index + 1}</td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-gray-900 font-medium">{item.productId?.title || item.productName || 'Product'}</td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-center text-gray-600">{item.quantity}</td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-right text-gray-600">₹{item.price}</td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-right font-semibold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end mb-6 md:mb-8">
              <div className="w-full md:w-80 text-xs md:text-sm">
                <div className="border-t-2 border-gray-300 pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="text-gray-900">₹{(selectedInvoice.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Delivery Charge:</span>
                    <span className="text-gray-900">₹{(selectedInvoice.deliveryCharge || 50).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-700">Discount:</span>
                    <span className="text-gray-900">-₹{(selectedInvoice.discount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t-2 border-gray-300 pt-4 bg-gray-50 p-3 rounded md:text-base">
                    <span className="font-bold text-gray-900">Grand Total:</span>
                    <span className="font-bold text-indigo-600">₹{(selectedInvoice.totalPrice || selectedInvoice.totalAmount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-3 md:p-4 bg-gray-50 rounded border border-gray-200 text-xs md:text-sm">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">Payment Method</p>
                <p className="text-sm font-semibold text-gray-900 capitalize mt-1">{selectedInvoice.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">Payment Status</p>
                <p className={`text-sm font-semibold mt-1 capitalize ${selectedInvoice.paymentStatus === 'completed' ? 'text-green-600' : selectedInvoice.paymentStatus === 'failed' ? 'text-red-600' : 'text-yellow-600'}`}>
                  {selectedInvoice.paymentStatus}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-gray-300 pt-4 md:pt-6 text-center text-xs md:text-sm">
              <p className="text-sm font-semibold text-gray-900 mb-2">Thank you for your order!</p>
              <p className="text-xs text-gray-600">For queries, please contact: support@deliveryapp.com</p>
              <p className="text-xs text-gray-500 mt-2">Invoice generated on {new Date().toLocaleString()}</p>
            </div>

            {/* Print Button */}
            <div className="mt-4 md:mt-6 flex flex-col md:flex-row justify-end gap-2 md:gap-3">
              <button
                onClick={() => window.print()}
                className="px-3 md:px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-semibold text-xs md:text-sm"
              >
                Print Invoice
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-3 md:px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-semibold text-xs md:text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
