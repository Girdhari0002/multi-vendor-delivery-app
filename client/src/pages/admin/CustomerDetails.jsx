import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { FaArrowLeft, FaLock, FaUnlock, FaEnvelope } from 'react-icons/fa';
import { toast } from 'react-toastify';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchCustomerData();
  }, [id, user, navigate]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/customers/${id}`);
      setCustomer(response.data.customer);
      setOrders(response.data.orders || []);
      setAddresses(response.data.addresses || []);
    } catch (error) {
      toast.error('Failed to load customer data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUnblock = async () => {
    try {
      setToggling(true);
      const newStatus = customer.isBlocked ? 'unblock' : 'block';
      await api.put(`/admin/customers/${id}/${newStatus}`);
      setCustomer((prev) => ({ ...prev, isBlocked: !prev.isBlocked }));
      toast.success(`Customer ${newStatus}ed successfully`);
    } catch (error) {
      toast.error(`Failed to ${customer.isBlocked ? 'unblock' : 'block'} customer`);
      console.error(error);
    } finally {
      setToggling(false);
    }
  };

  const calculateTotalSpent = () => {
    return orders
      .filter((o) => o.paymentStatus === 'completed')
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!customer) {
    return (
      <div className="text-center py-12 text-red-600">
        Customer not found
      </div>
    );
  }

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/admin/users')}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition"
        >
          <FaArrowLeft /> Back to Customers
        </button>

        {/* Customer Info */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-orange-400 flex items-center justify-center text-white text-4xl font-bold">
                {customer.profilePicture ? (
                  <img src={customer.profilePicture} alt={customer.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(customer.name)
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
                <p className="text-gray-600">{customer.email}</p>
                <p className="text-gray-600">{customer.phone}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Member since {new Date(customer.createdAt).toLocaleDateString()}
                </p>
                {customer.lastLogin && (
                  <p className="text-xs text-gray-500">
                    Last login: {new Date(customer.lastLogin).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className={`px-4 py-2 rounded-lg text-white font-semibold text-center ${
                customer.isBlocked
                  ? 'bg-red-600'
                  : 'bg-green-600'
              }`}>
                {customer.isBlocked ? 'BLOCKED' : 'ACTIVE'}
              </div>
              <button
                onClick={handleBlockUnblock}
                disabled={toggling}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                  customer.isBlocked
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {customer.isBlocked ? <FaUnlock /> : <FaLock />}
                {customer.isBlocked ? 'Unblock' : 'Block'}
              </button>
              <a
                href={`mailto:${customer.email}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2"
              >
                <FaEnvelope /> Send Email
              </a>
            </div>
          </div>

          {/* Personal Info */}
          <div className="border-t pt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-600 font-semibold">Full Name</label>
                <p className="text-lg text-gray-900 mt-1">{customer.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-semibold">Email</label>
                <p className="text-lg text-gray-900 mt-1">{customer.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-semibold">Phone</label>
                <p className="text-lg text-gray-900 mt-1">{customer.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-semibold">Gender</label>
                <p className="text-lg text-gray-900 mt-1">{customer.gender || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-semibold">Date of Birth</label>
                <p className="text-lg text-gray-900 mt-1">
                  {customer.dateOfBirth
                    ? new Date(customer.dateOfBirth).toLocaleDateString()
                    : 'Not provided'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-semibold">Total Amount Spent</label>
                <p className="text-lg font-bold text-orange-600">₹{calculateTotalSpent().toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Addresses */}
        {addresses.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Saved Addresses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map((address) => (
                <div key={address._id} className="border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900">{address.label}</h3>
                    {address.isDefault && (
                      <span className="bg-orange-400 text-white text-xs px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 text-sm mb-1">{address.street}</p>
                  <p className="text-gray-700 text-sm mb-1">
                    {address.city}, {address.state} - {address.zip}
                  </p>
                  <p className="text-gray-700 text-sm">{address.country}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order History */}
        {orders.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300 bg-gray-50">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Order ID</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Items</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Total</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Payment</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Status</th>
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
                      <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">{order.items?.length || 0}</td>
                      <td className="px-4 py-3 font-semibold">₹{order.totalPrice || 0}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.paymentStatus === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {order.paymentStatus || 'Pending'}
                        </span>
                      </td>
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

        {orders.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-600">
            No orders found for this customer
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetails;
