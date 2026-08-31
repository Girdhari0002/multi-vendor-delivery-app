import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { FaUser, FaBox, FaMoneyBillWave, FaMapMarkerAlt, FaCalendarAlt, FaTruck } from 'react-icons/fa';
import Tabs from '../../components/ui/Tabs';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import { Skeleton, SkeletonTable } from '../../components/ui/Skeleton';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const [assignAgentModalOpen, setAssignAgentModalOpen] = useState(false);
  const [agentIdToAssign, setAgentIdToAssign] = useState('');
  
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState('');

  const [refundConfirmOpen, setRefundConfirmOpen] = useState(false);
  
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
      // Non-critical
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchAgents();
  }, []);

  const updateStatus = async () => {
    if (!selectedOrder || !statusToUpdate) return;
    try {
      const { data } = await api.put(`/orders/${selectedOrder._id}/status`, { status: statusToUpdate });
      toast.success('Order status updated');
      if (data.borzoWarning) toast.warning(data.borzoWarning, { autoClose: false });
      fetchOrders();
      setStatusModalOpen(false);
      setIsDetailModalOpen(false);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const assignAgent = async () => {
    if (!selectedOrder || !agentIdToAssign) return;
    try {
      await api.put(`/orders/${selectedOrder._id}/assign-agent`, { agentId: agentIdToAssign });
      toast.success('Delivery agent assigned');
      fetchOrders();
      setAssignAgentModalOpen(false);
      setIsDetailModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign agent');
    }
  };

  const refundOrder = async () => {
    if (!selectedOrder) return;
    try {
      await api.post(`/payment/refund/${selectedOrder._id}`, {});
      toast.success('Refund processed');
      fetchOrders();
      setRefundConfirmOpen(false);
      setIsDetailModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Refund failed');
    }
  };

  const canRefund = (order) =>
    order?.paymentMethod === 'razorpay' && order?.paymentStatus === 'completed' && order?.refundStatus !== 'completed';

  const getPaymentStatusVariant = (status) => {
    if (status === 'completed') return 'success';
    if (status === 'failed') return 'danger';
    return 'warning';
  };

  const getOrderStatusVariant = (status) => {
    if (status === 'delivered') return 'success';
    if (status === 'shipped') return 'info';
    if (status === 'cancelled') return 'danger';
    return 'warning';
  };

  const tabOptions = [
    { key: 'All', label: 'All', count: orders.length },
    { key: 'placed', label: 'Placed', count: orders.filter(o => o.orderStatus === 'placed').length },
    { key: 'shipped', label: 'Shipped', count: orders.filter(o => o.orderStatus === 'shipped').length },
    { key: 'delivered', label: 'Delivered', count: orders.filter(o => o.orderStatus === 'delivered').length },
    { key: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.orderStatus === 'cancelled').length },
  ];

  const filteredOrders = useMemo(() => {
    if (activeTab === 'All') return orders;
    return orders.filter(o => o.orderStatus === activeTab);
  }, [orders, activeTab]);

  const columns = [
    {
      key: '_id',
      label: 'Order ID',
      render: (val) => <span className="font-semibold text-slate-700">#{val?.slice(-8)}</span>,
      sortable: true
    },
    {
      key: 'userId',
      label: 'Customer Name',
      render: (val) => val?.name || 'Unknown',
    },
    {
      key: 'orderItems',
      label: 'Items',
      render: (_, row) => row.orderItems?.length || 0,
    },
    {
      key: 'totalPrice',
      label: 'Total ₹',
      render: (_, row) => `₹${(row.totalPrice || row.totalAmount || 0).toFixed(2)}`,
      sortable: true
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (val) => (
        <Badge variant={getPaymentStatusVariant(val)} dot>{val}</Badge>
      )
    },
    {
      key: 'orderStatus',
      label: 'Status',
      render: (val) => (
        <Badge variant={getOrderStatusVariant(val)}>{val}</Badge>
      )
    },
    {
      key: 'deliveryAgentId',
      label: 'Delivery Agent',
      render: (val) => val?.name || <span className="text-slate-400">Unassigned</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); setSelectedOrder(row); setIsDetailModalOpen(true); }}
          >
            View
          </Button>
          <Button 
            variant="primary" 
            size="sm"
            onClick={(e) => { 
              e.stopPropagation(); 
              setSelectedOrder(row); 
              setAgentIdToAssign(row.deliveryAgentId?._id || '');
              setAssignAgentModalOpen(true); 
            }}
          >
            Agent
          </Button>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={(e) => { 
              e.stopPropagation(); 
              setSelectedOrder(row); 
              setStatusToUpdate(row.orderStatus);
              setStatusModalOpen(true); 
            }}
          >
            Status
          </Button>
          {canRefund(row) && (
            <Button 
              variant="danger" 
              size="sm"
              onClick={(e) => { 
                e.stopPropagation(); 
                setSelectedOrder(row); 
                setRefundConfirmOpen(true); 
              }}
            >
              Refund
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Order Management</h1>
          <p className="text-slate-500 text-sm">View and manage all customer orders.</p>
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        <Tabs 
          tabs={tabOptions} 
          activeTab={activeTab} 
          onChange={setActiveTab} 
          className="px-4 pt-4"
        />
        <div className="p-4">
          <DataTable 
            data={filteredOrders}
            columns={columns}
            loading={loading}
            searchable={true}
            searchPlaceholder="Search by Order ID or Customer..."
            pagination={true}
            pageSize={10}
            emptyMessage="No orders found for this status."
          />
        </div>
      </Card>

      {/* Order Detail Modal */}
      <Modal 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)} 
        title={`Order #${selectedOrder?._id?.slice(-8)}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl">
                <h3 className="flex items-center gap-2 font-semibold text-slate-800 mb-3"><FaUser className="text-slate-400" /> Customer</h3>
                <p className="text-sm text-slate-700">{selectedOrder.userId?.name || 'Unknown'}</p>
                <p className="text-sm text-slate-500">{selectedOrder.userId?.email || ''}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <h3 className="flex items-center gap-2 font-semibold text-slate-800 mb-3"><FaMapMarkerAlt className="text-slate-400" /> Delivery Address</h3>
                <p className="text-sm text-slate-700">{selectedOrder.shippingAddress?.address || 'N/A'}</p>
                <p className="text-sm text-slate-700">
                  {selectedOrder.shippingAddress?.city}{selectedOrder.shippingAddress?.postalCode ? `, ${selectedOrder.shippingAddress.postalCode}` : ''}
                </p>
              </div>
            </div>

            <div>
              <h3 className="flex items-center gap-2 font-semibold text-slate-800 mb-3"><FaBox className="text-slate-400" /> Items</h3>
              <div className="space-y-3">
                {selectedOrder.orderItems?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white border border-slate-100 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover" />}
                      <div>
                        <p className="text-sm font-medium text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-800">₹{item.price}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-4 text-lg font-bold text-slate-900">
                Total: ₹{(selectedOrder.totalPrice || selectedOrder.totalAmount || 0).toFixed(2)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl">
                <h3 className="flex items-center gap-2 font-semibold text-slate-800 mb-3"><FaMoneyBillWave className="text-slate-400" /> Payment Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Method</span>
                    <span className="font-medium capitalize">{selectedOrder.paymentMethod || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Status</span>
                    <Badge variant={getPaymentStatusVariant(selectedOrder.paymentStatus)} size="sm">{selectedOrder.paymentStatus}</Badge>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <h3 className="flex items-center gap-2 font-semibold text-slate-800 mb-3"><FaTruck className="text-slate-400" /> Delivery Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Status</span>
                    <Badge variant={getOrderStatusVariant(selectedOrder.orderStatus)} size="sm">{selectedOrder.orderStatus}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Agent</span>
                    <span className="font-medium">{selectedOrder.deliveryAgentId?.name || 'Unassigned'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Agent Modal */}
      <Modal 
        isOpen={assignAgentModalOpen} 
        onClose={() => setAssignAgentModalOpen(false)} 
        title="Assign Delivery Agent"
      >
        <div className="space-y-4 py-2">
          <Select 
            label="Select Agent" 
            value={agentIdToAssign}
            onChange={(e) => setAgentIdToAssign(e.target.value)}
            options={[
              { label: 'Unassigned', value: '' },
              ...agents.map(a => ({ label: a.name, value: a._id }))
            ]}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={() => setAssignAgentModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={assignAgent}>Assign</Button>
          </div>
        </div>
      </Modal>

      {/* Update Status Modal */}
      <Modal 
        isOpen={statusModalOpen} 
        onClose={() => setStatusModalOpen(false)} 
        title="Update Order Status"
      >
        <div className="space-y-4 py-2">
          <Select 
            label="Order Status" 
            value={statusToUpdate}
            onChange={(e) => setStatusToUpdate(e.target.value)}
            options={[
              { label: 'Placed', value: 'placed' },
              { label: 'Shipped', value: 'shipped' },
              { label: 'Delivered', value: 'delivered' },
              { label: 'Cancelled', value: 'cancelled' },
            ]}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={() => setStatusModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={updateStatus}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Refund Confirm Dialog */}
      <ConfirmDialog 
        isOpen={refundConfirmOpen}
        onClose={() => setRefundConfirmOpen(false)}
        onConfirm={refundOrder}
        title="Process Refund"
        message="Are you sure you want to refund this order via Razorpay? This action cannot be undone."
        confirmLabel="Refund Payment"
        variant="danger"
      />
    </div>
  );
};

export default AdminOrders;
