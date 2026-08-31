import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Spinner from '../../components/Spinner';
import { getSocket } from '../../api/socket';
import LiveTrackingMap from '../../components/LiveTrackingMap';
import Tabs from '../../components/ui/Tabs';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import StepProgress from '../../components/ui/StepProgress';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { FaBox, FaChevronDown, FaChevronUp, FaPhoneAlt } from 'react-icons/fa';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [cancelDialog, setCancelDialog] = useState({ isOpen: false, orderId: null });
  const [cancelling, setCancelling] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();

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

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/orders/user');
      setOrders(data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    const { orderId } = cancelDialog;
    if (!orderId) return;

    try {
      setCancelling(true);
      await api.put(`/orders/${orderId}/cancel`);
      toast.success('Order cancelled successfully');
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: 'cancelled' } : o));
      setCancelDialog({ isOpen: false, orderId: null });
    } catch (error) {
      toast.error('Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const tabs = [
    { key: 'All', label: 'All', count: orders.length },
    { key: 'placed', label: 'Placed', count: orders.filter(o => o.orderStatus === 'placed').length },
    { key: 'shipped', label: 'Shipped', count: orders.filter(o => o.orderStatus === 'shipped').length },
    { key: 'delivered', label: 'Delivered', count: orders.filter(o => o.orderStatus === 'delivered').length },
    { key: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.orderStatus === 'cancelled').length },
  ];

  const filteredOrders = activeTab === 'All' 
    ? orders 
    : orders.filter(o => o.orderStatus === activeTab);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      case 'shipped': return 'info';
      case 'placed': return 'primary';
      case 'failed': return 'danger';
      default: return 'neutral';
    }
  };

  const getSteps = (order) => {
    const status = order.orderStatus;
    const isCancelled = status === 'cancelled';
    const isFailed = status === 'failed';
    
    if (isCancelled || isFailed) {
      return [
        { label: 'Order Placed', timestamp: new Date(order.createdAt).toLocaleString(), completed: true },
        { label: isCancelled ? 'Cancelled' : 'Failed', completed: true, active: true }
      ];
    }

    const steps = [
      { label: 'Order Placed', timestamp: new Date(order.createdAt).toLocaleString(), completed: true }
    ];

    const isShipped = ['shipped', 'delivered'].includes(status);
    const isDelivered = status === 'delivered';

    steps.push({
      label: 'Packed/Processing',
      completed: isShipped,
      active: status === 'placed'
    });

    steps.push({
      label: 'Shipped',
      timestamp: order.shippedAt ? new Date(order.shippedAt).toLocaleString() : undefined,
      completed: isShipped,
      active: status === 'shipped'
    });

    steps.push({
      label: 'Delivered',
      timestamp: order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : undefined,
      completed: isDelivered,
      active: status === 'delivered'
    });

    return steps;
  };

  if (loading) return <div className="flex justify-center py-12"><Spinner /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Orders</h1>
      
      <div className="mb-6 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
        <Tabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onChange={setActiveTab} 
          variant="pills" 
        />
      </div>

      {filteredOrders.length === 0 ? (
        <Card>
          <EmptyState 
            icon={FaBox} 
            title="No orders yet" 
            description="Looks like you haven't placed any orders in this category." 
            actionLabel="Start Shopping"
            onAction={() => window.location.href = '/'}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const isExpanded = expandedOrderId === order._id;
            const statusLabel = order.orderStatus === 'failed' ? 'Failed' : order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1);
            
            return (
              <Card key={order._id} className="overflow-hidden" padding="none">
                <div 
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-slate-500">Order #{order._id.slice(-8)}</span>
                      <Badge variant={getStatusBadgeVariant(order.orderStatus)} size="sm">
                        {statusLabel}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                            {item.productId?.images?.[0] ? (
                              <img src={item.productId.images[0]} alt={item.productId.title} className="w-full h-full object-cover" />
                            ) : (
                              <FaBox className="text-slate-300 text-xs" />
                            )}
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                      <div className="text-slate-600 text-sm">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''} • <span className="font-semibold text-slate-900">₹{order.totalPrice || order.totalAmount || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex items-center justify-between md:justify-end w-full md:w-auto gap-4">
                    <div className="text-sm text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                      {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50 p-5 animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left Col: Items and Tracking */}
                      <div className="space-y-8">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Order Items</h4>
                          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                            <ul className="divide-y divide-slate-100">
                              {order.items.map(item => (
                                <li key={item.productId?._id || Math.random()} className="p-4 flex justify-between items-center">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-slate-100 rounded object-cover flex items-center justify-center overflow-hidden">
                                      {item.productId?.images?.[0] ? (
                                        <img src={item.productId.images[0]} alt={item.productId.title} className="w-full h-full object-cover" />
                                      ) : (
                                        <FaBox className="text-slate-300" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-medium text-slate-900 text-sm">{item.productId?.title || 'Unknown Product'}</p>
                                      <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                                    </div>
                                  </div>
                                  <div className="font-semibold text-slate-900">
                                    ₹{item.price * item.quantity}
                                  </div>
                                </li>
                              ))}
                            </ul>
                            <div className="bg-slate-50 p-4 flex justify-between items-center border-t border-slate-200">
                              <span className="font-medium text-slate-700">Total</span>
                              <span className="font-bold text-lg text-slate-900">₹{order.totalPrice || order.totalAmount || 0}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-slate-900 mb-6 uppercase tracking-wider">Order Status</h4>
                          <StepProgress steps={getSteps(order)} orientation="vertical" />
                        </div>
                      </div>

                      {/* Right Col: Map & Actions */}
                      <div className="space-y-6">
                        {order.orderStatus === 'shipped' && order.deliveryAgentId && (
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Live Tracking</h4>
                            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                              <LiveTrackingMap orderId={order._id} initialLocation={order.currentLocation} />
                            </div>
                            {order.deliveryAgentId && (
                              <div className="mt-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-slate-500 uppercase font-semibold">Delivery Partner</p>
                                  <p className="font-medium text-slate-900">{order.deliveryAgentId.name || 'Agent Assigned'}</p>
                                </div>
                                {order.deliveryAgentId.phone && (
                                  <a href={`tel:${order.deliveryAgentId.phone}`}>
                                    <Button size="sm" variant="outline" icon={<FaPhoneAlt />}>Call</Button>
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                          <h4 className="text-sm font-semibold text-slate-900 mb-2 uppercase tracking-wider">Delivery Details</h4>
                          <p className="text-slate-600 text-sm">{order.deliveryAddress}</p>
                        </div>

                        <div className="flex gap-3 pt-4">
                          {order.orderStatus === 'placed' && (
                            <Button 
                              variant="danger" 
                              onClick={() => setCancelDialog({ isOpen: true, orderId: order._id })}
                            >
                              Cancel Order
                            </Button>
                          )}
                          {order.orderStatus === 'delivered' && (
                            <Button 
                              variant="primary"
                              onClick={() => window.location.href = '/'}
                            >
                              Re-order Items
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={cancelDialog.isOpen}
        onClose={() => setCancelDialog({ isOpen: false, orderId: null })}
        onConfirm={handleCancelOrder}
        loading={cancelling}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        variant="danger"
        confirmLabel="Yes, Cancel Order"
      />
    </div>
  );
};

export default Orders;
