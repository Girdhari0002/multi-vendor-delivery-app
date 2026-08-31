import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { FaChevronRight, FaLock, FaUnlock, FaEnvelope } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Modal from '../../components/ui/Modal';
import { SkeletonCard, SkeletonText } from '../../components/ui/Skeleton';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [toggling, setToggling] = useState(false);
  
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/admin/customers/${id}`);
        setCustomer(response.data.customer);
        setOrders(response.data.orders || []);
        setAddresses(response.data.addresses || []);
      } catch (error) {
        toast.error('Failed to load customer data');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomerData();
  }, [id, user, navigate]);

  const handleBlockUnblock = async () => {
    try {
      setToggling(true);
      const newStatus = customer.isBlocked ? 'unblock' : 'block';
      await api.put(`/admin/customers/${id}/${newStatus}`);
      setCustomer(prev => ({ ...prev, isBlocked: !prev.isBlocked }));
      toast.success(`Customer ${newStatus}ed successfully`);
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setToggling(false);
      setConfirmDialog(false);
    }
  };

  const calculateTotalSpent = () => {
    return orders
      .filter((o) => o.paymentStatus === 'completed')
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <SkeletonText lines={1} className="w-1/4" />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!customer) return <div className="text-center py-12 text-red-500 font-medium">Customer not found</div>;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm font-medium text-slate-500 mb-6 space-x-2">
        <Link to="/admin" className="hover:text-orange-500 transition-colors">Admin</Link>
        <FaChevronRight size={10} />
        <Link to="/admin/users" className="hover:text-orange-500 transition-colors">Users</Link>
        <FaChevronRight size={10} />
        <span className="text-slate-900">{customer.name}</span>
      </nav>

      {/* Profile Card */}
      <Card className="mb-8 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Avatar src={customer.profilePicture} name={customer.name} size="xl" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-1">{customer.name}</h1>
              <div className="flex items-center gap-3 text-slate-500 mb-3">
                <FaEnvelope /> <span>{customer.email}</span>
                {customer.phone && <span>• {customer.phone}</span>}
              </div>
              <Badge variant={customer.isBlocked ? 'danger' : 'success'} dot>
                {customer.isBlocked ? 'BLOCKED' : 'ACTIVE'}
              </Badge>
              <p className="text-xs text-slate-400 mt-3">Member since {new Date(customer.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <Button
              variant={customer.isBlocked ? 'success' : 'danger'}
              icon={customer.isBlocked ? <FaUnlock /> : <FaLock />}
              onClick={() => setConfirmDialog(true)}
            >
              {customer.isBlocked ? 'Unblock' : 'Block'}
            </Button>
            <Button
              variant="outline"
              icon={<FaEnvelope />}
              onClick={() => window.location.href = `mailto:${customer.email}`}
            >
              Email
            </Button>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-8 pt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Gender</p>
            <p className="font-semibold text-slate-900">{customer.gender || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Date of Birth</p>
            <p className="font-semibold text-slate-900">{customer.dateOfBirth ? new Date(customer.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Orders</p>
            <p className="font-semibold text-slate-900">{orders.length}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Spent</p>
            <p className="font-bold text-orange-500 text-lg">₹{calculateTotalSpent().toFixed(2)}</p>
          </div>
        </div>
      </Card>

      {/* Saved Addresses */}
      {addresses.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Saved Addresses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {addresses.map((address) => (
              <Card key={address._id} padding="md" className="border-l-4 border-l-orange-500">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-800">{address.label || 'Address'}</h3>
                  {address.isDefault && <Badge variant="primary" size="sm">Default</Badge>}
                </div>
                <p className="text-sm text-slate-600 mb-1">{address.street}</p>
                <p className="text-sm text-slate-600">{address.city}, {address.state} - {address.zip}</p>
                <p className="text-sm text-slate-600 font-medium mt-2">{address.country}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Orders */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Order History</h2>
        {orders.length > 0 ? (
          <Card padding="none" className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Payment</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">#{order._id.slice(-8).toUpperCase()}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">₹{order.totalPrice || 0}</td>
                    <td className="px-6 py-4">
                      <Badge variant={order.paymentStatus === 'completed' ? 'success' : 'warning'}>
                        {order.paymentStatus || 'Pending'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={order.orderStatus === 'delivered' ? 'success' : 'primary'}>
                        {order.orderStatus || 'Processing'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ) : (
          <div className="text-slate-500 p-8 text-center bg-white rounded-xl border border-slate-100">
            No orders found for this customer.
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        onConfirm={handleBlockUnblock}
        loading={toggling}
        title={customer.isBlocked ? 'Unblock Customer' : 'Block Customer'}
        message={`Are you sure you want to ${customer.isBlocked ? 'unblock' : 'block'} ${customer.name}?`}
        variant="warning"
      />

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal isOpen={true} onClose={() => setSelectedOrder(null)} className="max-w-2xl">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Order #{selectedOrder._id.slice(-8).toUpperCase()}</h2>
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div><span className="text-slate-500">Date:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</div>
              <div><span className="text-slate-500">Total:</span> ₹{selectedOrder.totalPrice}</div>
              <div><span className="text-slate-500">Status:</span> {selectedOrder.orderStatus}</div>
              <div><span className="text-slate-500">Payment:</span> {selectedOrder.paymentStatus}</div>
            </div>
            <h3 className="font-bold text-slate-800 mb-3">Items</h3>
            <ul className="space-y-3">
              {(selectedOrder.items || []).map((item, idx) => (
                <li key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded overflow-hidden">
                      {item.product?.image && <img src={item.product.image} className="w-full h-full object-cover" alt="" />}
                    </div>
                    <div>
                      <p className="font-medium">{item.product?.title || 'Unknown Product'}</p>
                      <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="font-bold">₹{item.price * item.quantity}</div>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CustomerDetails;
