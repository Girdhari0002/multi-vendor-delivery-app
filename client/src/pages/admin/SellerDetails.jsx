import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { FaChevronRight, FaCheck, FaTimes, FaTrash, FaEnvelope } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Modal from '../../components/ui/Modal';
import { SkeletonCard, SkeletonText } from '../../components/ui/Skeleton';

const SellerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: null, loading: false });
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    const fetchSellerData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/admin/sellers/${id}`);
        setSeller(response.data.seller);
        setProducts(response.data.products || []);
        setOrders(response.data.orders || []);
      } catch (error) {
        toast.error('Failed to load seller data');
      } finally {
        setLoading(false);
      }
    };
    fetchSellerData();
  }, [id, user, navigate]);

  const handleAction = async () => {
    setConfirmDialog(prev => ({ ...prev, loading: true }));
    try {
      if (confirmDialog.type === 'toggle') {
        const newStatus = seller.storeStatus === 'active' ? 'inactive' : 'active';
        await api.put(`/admin/sellers/${id}`, { storeStatus: newStatus });
        setSeller(prev => ({ ...prev, storeStatus: newStatus }));
        toast.success(`Store ${newStatus} successfully`);
      } else if (confirmDialog.type === 'delete') {
        await api.delete(`/admin/sellers/${id}`);
        toast.success('Seller deleted successfully');
        navigate('/admin/sellers');
      }
    } catch (error) {
      toast.error('Action failed');
    } finally {
      setConfirmDialog({ isOpen: false, type: null, loading: false });
    }
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

  if (!seller) return <div className="text-center py-12 text-red-500 font-medium">Seller not found</div>;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm font-medium text-slate-500 mb-6 space-x-2">
        <Link to="/admin" className="hover:text-orange-500 transition-colors">Admin</Link>
        <FaChevronRight size={10} />
        <Link to="/admin/sellers" className="hover:text-orange-500 transition-colors">Sellers</Link>
        <FaChevronRight size={10} />
        <span className="text-slate-900">{seller.businessName || seller.name}</span>
      </nav>

      {/* Seller Profile Card */}
      <Card className="mb-8 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Avatar src={seller.storeLogo} name={seller.businessName || seller.name} size="xl" className="rounded-lg" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-1">{seller.businessName || 'No Business Name'}</h1>
              <div className="text-slate-500 mb-3 space-y-1">
                <p className="flex items-center gap-2"><FaEnvelope /> {seller.email}</p>
                <p>{seller.name} • {seller.phone || 'No phone'}</p>
              </div>
              <Badge variant={seller.storeStatus === 'active' ? 'success' : 'danger'} dot>
                {seller.storeStatus === 'active' ? 'ACTIVE' : 'INACTIVE'}
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button
              variant={seller.storeStatus === 'active' ? 'warning' : 'success'}
              icon={seller.storeStatus === 'active' ? <FaTimes /> : <FaCheck />}
              onClick={() => setConfirmDialog({ isOpen: true, type: 'toggle', loading: false })}
            >
              {seller.storeStatus === 'active' ? 'Deactivate' : 'Activate'}
            </Button>
            <Button
              variant="danger"
              icon={<FaTrash />}
              onClick={() => setConfirmDialog({ isOpen: true, type: 'delete', loading: false })}
            >
              Delete Store
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Store Info */}
        <Card>
          <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Store Information</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Business Name</p>
              <p className="font-semibold text-slate-900">{seller.businessName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Business Type</p>
              <p className="font-semibold text-slate-900">{seller.businessType || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">GST Number</p>
              <p className="font-semibold text-slate-900">{seller.gstNumber || 'Not provided'}</p>
            </div>
            {seller.storeDescription && (
              <div>
                <p className="text-sm font-medium text-slate-500">Description</p>
                <p className="text-sm text-slate-700">{seller.storeDescription}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Bank Details */}
        <Card>
          <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Bank Details (Masked)</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Account Number</p>
              <p className="font-mono font-medium text-slate-900">{seller.bankDetails?.accountNumber || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">IFSC Code</p>
              <p className="font-semibold text-slate-900">{seller.bankDetails?.ifsc || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Bank Name</p>
              <p className="font-semibold text-slate-900">{seller.bankDetails?.bankName || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">UPI ID</p>
              <p className="font-semibold text-slate-900">{seller.upiId || 'Not provided'}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Products & Orders */}
      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-4">Products ({products.length})</h3>
          {products.length > 0 ? (
            <Card padding="none" className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-medium">Product</th>
                    <th className="px-6 py-4 font-medium">Price</th>
                    <th className="px-6 py-4 font-medium">Stock</th>
                    <th className="px-6 py-4 font-medium">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded overflow-hidden">
                          {product.image && <img src={product.image} className="w-full h-full object-cover" alt="" />}
                        </div>
                        <span className="font-medium text-slate-800">{product.title || product.name}</span>
                      </td>
                      <td className="px-6 py-4 font-bold">₹{product.price}</td>
                      <td className="px-6 py-4">{product.stock || 0}</td>
                      <td className="px-6 py-4">⭐ {product.rating?.toFixed(1) || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          ) : (
            <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-100">No products found</div>
          )}
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-4">Orders ({orders.length})</h3>
          {orders.length > 0 ? (
            <Card padding="none" className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-medium">Order ID</th>
                    <th className="px-6 py-4 font-medium">Customer</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-800">#{order._id.slice(-8).toUpperCase()}</td>
                      <td className="px-6 py-4">{order.customer?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 font-bold">₹{order.totalPrice || 0}</td>
                      <td className="px-6 py-4">
                        <Badge variant={order.orderStatus === 'delivered' ? 'success' : 'primary'}>
                          {order.orderStatus || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          ) : (
            <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-100">No orders found</div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, type: null, loading: false })}
        onConfirm={handleAction}
        loading={confirmDialog.loading}
        title={confirmDialog.type === 'delete' ? 'Delete Seller' : 'Confirm Action'}
        message={confirmDialog.type === 'delete' 
          ? "Are you sure you want to delete this seller? This cannot be undone." 
          : `Are you sure you want to ${seller.storeStatus === 'active' ? 'deactivate' : 'activate'} this store?`}
        variant={confirmDialog.type === 'delete' ? 'danger' : 'warning'}
        confirmLabel={confirmDialog.type === 'delete' ? 'Delete' : 'Confirm'}
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

export default SellerDetails;
