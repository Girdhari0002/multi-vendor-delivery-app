import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import Card from '../../components/ui/Card';
import Tabs from '../../components/ui/Tabs';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { FaSearch, FaBox, FaTruck, FaCheckCircle, FaFileInvoice } from 'react-icons/fa';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  
  const [statusDialog, setStatusDialog] = useState({ isOpen: false, orderId: null, currentStatus: '', nextStatus: '' });
  const [updating, setUpdating] = useState(false);

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

  const handleStatusUpdate = async () => {
    setUpdating(true);
    try {
      const { data } = await api.put(`/orders/${statusDialog.orderId}/status`, { status: statusDialog.nextStatus });
      toast.success('Order status updated');
      if (data.borzoWarning) toast.warning(data.borzoWarning, { autoClose: false });
      fetchOrders();
      setStatusDialog({ isOpen: false, orderId: null, currentStatus: '', nextStatus: '' });
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'delivered': return { variant: 'success', label: 'Delivered', icon: <FaCheckCircle className="mr-1" /> };
      case 'shipped': return { variant: 'info', label: 'Shipped', icon: <FaTruck className="mr-1" /> };
      case 'placed': return { variant: 'warning', label: 'Placed', icon: <FaBox className="mr-1" /> };
      default: return { variant: 'neutral', label: status, icon: null };
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchSearch = order._id.toLowerCase().includes(search.toLowerCase()) || 
                          (order.userId?.name || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = activeTab === 'all' || order.orderStatus === activeTab;
      return matchSearch && matchStatus;
    });
  }, [orders, search, activeTab]);

  const tabs = [
    { key: 'all', label: 'All Orders', count: orders.length },
    { key: 'placed', label: 'Placed', count: orders.filter(o => o.orderStatus === 'placed').length },
    { key: 'shipped', label: 'Shipped', count: orders.filter(o => o.orderStatus === 'shipped').length },
    { key: 'delivered', label: 'Delivered', count: orders.filter(o => o.orderStatus === 'delivered').length }
  ];

  const getNextStatusAction = (order) => {
    if (order.orderStatus === 'placed') {
      return { label: 'Mark as Shipped', nextStatus: 'shipped', variant: 'primary' };
    } else if (order.orderStatus === 'shipped') {
      return { label: 'Mark as Delivered', nextStatus: 'delivered', variant: 'success' };
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Store Orders</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and update order statuses</p>
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <Tabs 
            tabs={tabs} 
            activeTab={activeTab} 
            onChange={setActiveTab} 
            variant="pills"
            className="w-full sm:w-auto"
          />
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search ID or Customer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              icon={<FaSearch />}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-6">
            <SkeletonTable rows={5} cols={5} />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={FaBox}
              title="No orders found"
              description={search ? "Try adjusting your search criteria." : `There are no ${activeTab === 'all' ? '' : activeTab} orders right now.`}
              actionLabel={search ? "Clear Search" : undefined}
              onAction={() => setSearch('')}
            />
          </div>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200 uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map(order => {
                    const statusInfo = getStatusInfo(order.orderStatus);
                    const nextAction = getNextStatusAction(order);
                    return (
                      <tr key={order._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">#{order._id.slice(-8)}</td>
                        <td className="px-6 py-4 text-slate-700">{order.userId?.name || 'Customer'}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">₹{(order.totalPrice || order.totalAmount || 0).toFixed(2)}</td>
                        <td className="px-6 py-4 text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <Badge variant={statusInfo.variant} className="flex items-center w-fit">
                            {statusInfo.icon} {statusInfo.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Button variant="outline" size="sm" icon={<FaFileInvoice />} onClick={() => toast.info('Invoice viewing logic here (using existing modal component from original if needed)')}>
                            Invoice
                          </Button>
                          {nextAction && (
                            <Button 
                              variant={nextAction.variant} 
                              size="sm"
                              onClick={() => setStatusDialog({ 
                                isOpen: true, 
                                orderId: order._id, 
                                currentStatus: order.orderStatus, 
                                nextStatus: nextAction.nextStatus 
                              })}
                            >
                              {nextAction.label}
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredOrders.map(order => {
                const statusInfo = getStatusInfo(order.orderStatus);
                const nextAction = getNextStatusAction(order);
                return (
                  <div key={order._id} className="p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-slate-900 mb-1">#{order._id.slice(-8)}</div>
                        <div className="text-sm text-slate-600">{order.userId?.name || 'Customer'}</div>
                      </div>
                      <Badge variant={statusInfo.variant} className="flex items-center">
                        {statusInfo.icon} {statusInfo.label}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm border-t border-slate-50 pt-3">
                      <div className="text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                      <div className="font-bold text-slate-900 text-base">₹{(order.totalPrice || order.totalAmount || 0).toFixed(2)}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button variant="outline" size="sm" icon={<FaFileInvoice />} fullWidth onClick={() => toast.info('Invoice viewing logic here')}>
                        Invoice
                      </Button>
                      {nextAction && (
                        <Button 
                          variant={nextAction.variant} 
                          size="sm" 
                          fullWidth
                          onClick={() => setStatusDialog({ 
                            isOpen: true, 
                            orderId: order._id, 
                            currentStatus: order.orderStatus, 
                            nextStatus: nextAction.nextStatus 
                          })}
                        >
                          {nextAction.label}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      <ConfirmDialog
        isOpen={statusDialog.isOpen}
        onClose={() => setStatusDialog({ isOpen: false, orderId: null, currentStatus: '', nextStatus: '' })}
        onConfirm={handleStatusUpdate}
        title="Update Order Status"
        message={`Are you sure you want to mark this order as ${statusDialog.nextStatus}?`}
        confirmLabel={`Mark as ${statusDialog.nextStatus}`}
        variant="info"
        loading={updating}
      />
    </div>
  );
};

export default SellerOrders;
