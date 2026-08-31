import React, { useState, useEffect } from 'react';
import { FaTicketAlt, FaTrash, FaPlus, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonCard } from '../../components/ui/Skeleton';

const emptyForm = {
  code: '', discountType: 'flat', discountValue: '', maxDiscount: '',
  minOrderValue: '', expiryDate: '', usageLimit: '',
};

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);

  const fetchCoupons = async () => {
    try {
      const { data } = await api.get('/coupons');
      setCoupons(data);
    } catch (error) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.discountType === 'percent' && Number(form.discountValue) > 100) {
      toast.error('Percentage discount cannot exceed 100%');
      return;
    }
    
    setSubmitting(true);
    try {
      const payload = {
        code: form.code.toUpperCase(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        ...(form.maxDiscount && { maxDiscount: Number(form.maxDiscount) }),
        ...(form.minOrderValue && { minOrderValue: Number(form.minOrderValue) }),
        ...(form.expiryDate && { expiryDate: form.expiryDate }),
        ...(form.usageLimit && { usageLimit: Number(form.usageLimit) }),
      };
      await api.post('/coupons', payload);
      toast.success('Coupon created successfully');
      setForm(emptyForm);
      setIsModalOpen(false);
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (coupon) => {
    try {
      await api.put(`/coupons/${coupon._id}`, { active: !coupon.active });
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to update coupon status');
    }
  };

  const handleDelete = async () => {
    if (!couponToDelete) return;
    try {
      await api.delete(`/coupons/${couponToDelete._id}`);
      toast.success('Coupon deleted');
      fetchCoupons();
      setDeleteConfirmOpen(false);
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  const isExpired = (date) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const getStatusBadge = (coupon) => {
    if (!coupon.active) return <Badge variant="neutral">Disabled</Badge>;
    if (isExpired(coupon.expiryDate)) return <Badge variant="danger">Expired</Badge>;
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return <Badge variant="warning">Limit Reached</Badge>;
    return <Badge variant="success">Active</Badge>;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Coupon Management</h1>
          <p className="text-slate-500 text-sm">Create and manage discount codes for customers.</p>
        </div>
        <Button 
          variant="primary" 
          icon={<FaPlus />} 
          onClick={() => { setForm(emptyForm); setIsModalOpen(true); }}
        >
          Create Coupon
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : coupons.length === 0 ? (
        <Card className="py-12">
          <EmptyState 
            icon={FaTicketAlt}
            title="No coupons yet" 
            description="Create your first discount coupon to offer promotions to your customers."
            actionLabel="Create Coupon"
            onAction={() => setIsModalOpen(true)}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coupons.map(coupon => (
            <Card key={coupon._id} hover className="flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                {getStatusBadge(coupon)}
              </div>
              
              <div className="mb-4">
                <span className="inline-block px-4 py-2 bg-orange-100 text-orange-600 font-bold text-xl tracking-wider rounded-lg border border-orange-200 border-dashed">
                  {coupon.code}
                </span>
              </div>
              
              <div className="space-y-2 mb-6">
                <p className="text-lg font-semibold text-slate-800">
                  {coupon.discountType === 'percent' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                </p>
                <div className="text-sm text-slate-500 space-y-1">
                  <p>Minimum Order: <span className="font-medium text-slate-700">₹{coupon.minOrderValue || 0}</span></p>
                  {coupon.maxDiscount > 0 && <p>Max Discount: <span className="font-medium text-slate-700">₹{coupon.maxDiscount}</span></p>}
                  <p>Expiry: <span className="font-medium text-slate-700">{coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Never'}</span></p>
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500">Used:</span>
                  <span className="font-medium text-slate-700">{coupon.usedCount}</span>
                  {coupon.usageLimit > 0 && <span className="text-slate-400">/ {coupon.usageLimit}</span>}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant={coupon.active ? 'outline' : 'success'} 
                    size="sm"
                    onClick={() => toggleActive(coupon)}
                  >
                    {coupon.active ? 'Disable' : 'Enable'}
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={() => { setCouponToDelete(coupon); setDeleteConfirmOpen(true); }}
                  >
                    <FaTrash />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Coupon Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Coupon" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Coupon Code" 
              name="code" 
              placeholder="e.g. WELCOME50" 
              value={form.code} 
              onChange={handleChange} 
              required 
              className="uppercase"
            />
            <Select 
              label="Discount Type" 
              name="discountType" 
              value={form.discountType} 
              onChange={handleChange}
              options={[
                { label: 'Flat Amount (₹)', value: 'flat' },
                { label: 'Percentage (%)', value: 'percent' }
              ]}
            />
            <Input 
              label="Discount Value" 
              name="discountValue" 
              type="number" 
              min="0" 
              step="0.01" 
              placeholder="e.g. 50" 
              value={form.discountValue} 
              onChange={handleChange} 
              required 
            />
            <Input 
              label="Max Discount Cap (₹)" 
              name="maxDiscount" 
              type="number" 
              min="0" 
              step="0.01" 
              placeholder="Leave empty for no limit" 
              value={form.maxDiscount} 
              onChange={handleChange} 
            />
            <Input 
              label="Minimum Order Value (₹)" 
              name="minOrderValue" 
              type="number" 
              min="0" 
              step="0.01" 
              placeholder="e.g. 500" 
              value={form.minOrderValue} 
              onChange={handleChange} 
            />
            <Input 
              label="Usage Limit" 
              name="usageLimit" 
              type="number" 
              min="1" 
              placeholder="Total times it can be used" 
              value={form.usageLimit} 
              onChange={handleChange} 
            />
            <Input 
              label="Expiry Date" 
              name="expiryDate" 
              type="date" 
              value={form.expiryDate} 
              onChange={handleChange} 
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={submitting}>Create Coupon</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog 
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Coupon"
        message={`Are you sure you want to delete coupon ${couponToDelete?.code}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

export default Coupons;
