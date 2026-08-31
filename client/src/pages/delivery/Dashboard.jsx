import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { 
  FaTruck, 
  FaCheckCircle, 
  FaMapMarkerAlt, 
  FaLocationArrow, 
  FaPhoneAlt, 
  FaDirections, 
  FaCheck
} from 'react-icons/fa';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonCard } from '../../components/ui/Skeleton';

const DeliveryDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [online, setOnline] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, orderId: null });
  const [completedToday, setCompletedToday] = useState(0);
  
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

  const handleConfirmDeliver = async () => {
    const orderId = confirmDialog.orderId;
    if (!orderId) return;
    
    try {
      await api.put(`/delivery/orders/${orderId}/deliver`);
      toast.success('Order marked as delivered');
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      setCompletedToday(prev => prev + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order');
    } finally {
      setConfirmDialog({ isOpen: false, orderId: null });
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
      {/* Header section with status toggle */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Delivery Agent Portal</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
          <span className={`text-sm font-semibold ${online ? 'text-emerald-600' : 'text-slate-500'}`}>
            {online ? 'Online' : 'Offline'}
          </span>
          <button 
            onClick={() => setOnline(!online)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${online ? 'bg-emerald-500' : 'bg-slate-300'}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${online ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Active"
          value={orders.length}
          icon={FaTruck}
          color="warning"
        />
        <StatCard
          title="Completed"
          value={completedToday}
          icon={FaCheckCircle}
          color="success"
        />
        <StatCard
          title="Location"
          value={sharing ? "ON" : "OFF"}
          icon={FaMapMarkerAlt}
          color={sharing ? "success" : "neutral"}
          className="col-span-2 sm:col-span-1"
        />
      </div>

      {/* Location Sharing Card */}
      <Card className="mb-8" padding="md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              Location Sharing
              {sharing && (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              )}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {sharing ? 'Live location sharing is active. Customers can track you.' : 'Start sharing your location to help customers track their orders.'}
            </p>
          </div>
          <Button
            variant={sharing ? 'danger' : 'success'}
            icon={sharing ? null : <FaLocationArrow />}
            onClick={sharing ? stopSharing : startSharing}
            fullWidth={false}
            className="sm:w-auto w-full"
          >
            {sharing ? 'Stop Sharing Location' : 'Start Sharing Location'}
          </Button>
        </div>
      </Card>

      {/* Assigned Orders Section */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">My Deliveries</h2>
        <Badge variant="primary" dot>{orders.length}</Badge>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={FaTruck}
          title="No deliveries assigned"
          description="You have no active deliveries assigned to you right now. Take a break!"
        />
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map(order => (
            <Card key={order._id} className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-500">#{order._id.slice(-6)}</span>
                  <Badge variant="warning">{order.status || 'Assigned'}</Badge>
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 bg-blue-50 text-blue-500 rounded-full shrink-0">
                    <FaPhoneAlt size={14} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{order.customer?.name}</p>
                    <a href={`tel:${order.customer?.phone}`} className="text-blue-600 font-medium hover:underline inline-block mt-0.5">
                      {order.customer?.phone}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 bg-orange-50 text-orange-500 rounded-full shrink-0">
                    <FaMapMarkerAlt size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Delivery Address</p>
                    <p className="text-slate-800 mt-0.5 leading-snug">{order.deliveryAddress}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-2 pt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  className="flex-1 !text-emerald-600 !border-emerald-200 hover:!bg-emerald-50 hover:!border-emerald-300"
                  icon={<FaDirections />}
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.deliveryAddress)}`, '_blank')}
                >
                  Navigate
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  icon={<FaCheck />}
                  onClick={() => setConfirmDialog({ isOpen: true, orderId: order._id })}
                >
                  Mark Delivered
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, orderId: null })}
        onConfirm={handleConfirmDeliver}
        title="Confirm Delivery"
        message="Are you sure you want to mark this order as delivered? This action cannot be undone."
        confirmLabel="Yes, Mark Delivered"
        variant="warning"
      />
    </div>
  );
};

export default DeliveryDashboard;
