import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { FaArrowLeft, FaCheck, FaTimes, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';

const SellerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchSellerData();
  }, [id, user, navigate]);

  const fetchSellerData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/sellers/${id}`);
      setSeller(response.data.seller);
      setProducts(response.data.products || []);
      setOrders(response.data.orders || []);
    } catch (error) {
      toast.error('Failed to load seller data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setToggling(true);
      const newStatus = seller.storeStatus === 'active' ? 'inactive' : 'active';
      await api.put(`/admin/sellers/${id}`, { storeStatus: newStatus });
      setSeller((prev) => ({ ...prev, storeStatus: newStatus }));
      toast.success(`Store ${newStatus} successfully`);
    } catch (error) {
      toast.error('Failed to update store status');
      console.error(error);
    } finally {
      setToggling(false);
    }
  };

  const handleDeleteSeller = async () => {
    if (window.confirm('Are you sure you want to delete this seller account? This action cannot be undone.')) {
      try {
        await api.delete(`/admin/sellers/${id}`);
        toast.success('Seller account deleted successfully');
        navigate('/admin/users');
      } catch (error) {
        toast.error('Failed to delete seller account');
        console.error(error);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!seller) {
    return (
      <div className="text-center py-12 text-red-600">
        Seller not found
      </div>
    );
  }

  const maskAccountNumber = (accountNumber) => {
    if (!accountNumber) return 'Not provided';
    return accountNumber; // Show full account number
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/admin/users')}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition"
        >
          <FaArrowLeft /> Back to Users
        </button>

        {/* Seller Info */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                {seller.storeLogo ? (
                  <img src={seller.storeLogo} alt={seller.businessName} className="w-full h-full object-cover" />
                ) : (
                  '📦'
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{seller.businessName}</h1>
                <p className="text-gray-600">{seller.name}</p>
                <p className="text-gray-600">{seller.email}</p>
                <p className="text-gray-600">{seller.phone}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleToggleStatus}
                disabled={toggling}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition text-white ${
                  seller.storeStatus === 'active'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {seller.storeStatus === 'active' ? <FaCheck /> : <FaTimes />}
                {seller.storeStatus === 'active' ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={handleDeleteSeller}
                className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition font-semibold flex items-center justify-center gap-2"
              >
                <FaTrash /> Delete Account
              </button>
            </div>
          </div>

          {/* Store Info */}
          <div className="border-t pt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Store Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-sm text-gray-600 font-semibold">Business Name</label>
                <p className="text-lg text-gray-900 mt-1">{seller.businessName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-semibold">Business Type</label>
                <p className="text-lg text-gray-900 mt-1">{seller.businessType || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-semibold">GST Number</label>
                <p className="text-lg text-gray-900 mt-1">{seller.gstNumber || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-semibold">Store Status</label>
                <p className={`text-lg font-bold mt-1 ${
                  seller.storeStatus === 'active' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {seller.storeStatus === 'active' ? 'ACTIVE' : 'INACTIVE'}
                </p>
              </div>
            </div>
            {seller.storeDescription && (
              <div>
                <label className="text-sm text-gray-600 font-semibold">Store Description</label>
                <p className="text-gray-700 mt-1">{seller.storeDescription}</p>
              </div>
            )}
          </div>

          {/* Bank Details */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Bank Details (Masked)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-600 font-semibold">Account Number</label>
                <p className="text-lg font-mono text-gray-900 mt-1">{maskAccountNumber(seller.bankDetails?.accountNumber)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-semibold">IFSC Code</label>
                <p className="text-lg text-gray-900 mt-1">{seller.bankDetails?.ifsc || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-semibold">Bank Name</label>
                <p className="text-lg text-gray-900 mt-1">{seller.bankDetails?.bankName || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-semibold">UPI ID</label>
                <p className="text-lg text-gray-900 mt-1">{seller.upiId || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        {products.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Products ({products.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300 bg-gray-50">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Product Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Price</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Stock</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Rating</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <span className="font-semibold text-gray-900">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold">₹{product.price}</td>
                      <td className="px-4 py-3">{product.stock || 0}</td>
                      <td className="px-4 py-3">⭐ {product.rating?.toFixed(1) || 0}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/product/${product._id}`)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders */}
        {orders.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Orders ({orders.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300 bg-gray-50">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Order ID</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Customer</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Amount</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <a
                          href={`/admin/orders/${order._id}`}
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          {order._id.slice(-8).toUpperCase()}
                        </a>
                      </td>
                      <td className="px-4 py-3">{order.customer?.name || 'Unknown'}</td>
                      <td className="px-4 py-3 font-semibold">₹{order.totalPrice || 0}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.orderStatus === 'delivered'
                              ? 'bg-green-100 text-green-800'
                              : order.orderStatus === 'shipped'
                              ? 'bg-blue-100 text-blue-800'
                              : order.orderStatus === 'placed'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {order.orderStatus || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/admin/orders/${order._id}`)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {products.length === 0 && orders.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-600">
            No products or orders found for this seller
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDetails;
