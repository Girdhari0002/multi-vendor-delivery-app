import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { FaMotorcycle, FaTrash, FaPlus, FaPhone, FaEnvelope, FaUserPlus } from 'react-icons/fa';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonProfile } from '../../components/ui/Skeleton';

const emptyForm = { name: '', email: '', password: '', phone: '', vehicleType: 'bike', vehicleNumber: '' };

const ManageDeliveryAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState(null);

  const fetchAgents = async () => {
    try {
      const { data } = await api.get('/admin/delivery-agents');
      setAgents(data);
    } catch (error) {
      toast.error('Failed to load delivery agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/delivery-agents', form);
      toast.success('Delivery agent created successfully');
      setForm(emptyForm);
      setIsModalOpen(false);
      fetchAgents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create delivery agent');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!agentToDelete) return;
    try {
      await api.delete(`/admin/delivery-agents/${agentToDelete._id}`);
      toast.success('Delivery agent removed');
      fetchAgents();
      setDeleteConfirmOpen(false);
    } catch (error) {
      toast.error('Failed to remove delivery agent');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Delivery Agents</h1>
          <p className="text-slate-500 text-sm">Manage your delivery fleet and partner accounts.</p>
        </div>
        <Button 
          variant="primary" 
          icon={<FaPlus />} 
          onClick={() => { setForm(emptyForm); setIsModalOpen(true); }}
        >
          Add Agent
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card><SkeletonProfile /></Card>
          <Card><SkeletonProfile /></Card>
          <Card><SkeletonProfile /></Card>
        </div>
      ) : agents.length === 0 ? (
        <Card className="py-12">
          <EmptyState 
            icon={FaMotorcycle}
            title="No delivery agents found" 
            description="You don't have any delivery partners registered yet."
            actionLabel="Add Agent"
            onAction={() => setIsModalOpen(true)}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Card key={agent._id} hover className="flex flex-col">
              <div className="flex items-start gap-4 mb-4">
                <Avatar name={agent.name} size="lg" />
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-semibold text-lg text-slate-900 truncate">{agent.name}</h3>
                  <div className="flex items-center text-sm text-slate-500 mt-1 gap-2 truncate">
                    <FaMotorcycle className="text-slate-400 flex-shrink-0" />
                    <span className="capitalize">{agent.vehicleType || 'Unknown'}</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-medium border border-slate-200">
                      {agent.vehicleNumber || 'No Plate'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mt-2 mb-6">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <FaEnvelope className="text-slate-400" />
                  <span className="truncate">{agent.email}</span>
                </div>
                {agent.phone && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <FaPhone className="text-slate-400" />
                    <span>{agent.phone}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-auto pt-4 border-t border-slate-100 flex justify-end">
                <Button 
                  variant="ghost" 
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  size="sm"
                  onClick={() => { setAgentToDelete(agent); setDeleteConfirmOpen(true); }}
                >
                  <FaTrash className="mr-2" /> Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Agent Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Delivery Agent" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Full Name" 
              name="name" 
              placeholder="e.g. John Doe" 
              value={form.name} 
              onChange={handleChange} 
              required 
            />
            <Input 
              label="Email Address" 
              name="email" 
              type="email" 
              placeholder="john@example.com" 
              value={form.email} 
              onChange={handleChange} 
              required 
            />
            <Input 
              label="Password" 
              name="password" 
              type="password" 
              placeholder="Min 6 characters" 
              minLength={6} 
              value={form.password} 
              onChange={handleChange} 
              required 
            />
            <Input 
              label="Phone Number" 
              name="phone" 
              placeholder="e.g. 9876543210" 
              value={form.phone} 
              onChange={handleChange} 
            />
            <Select 
              label="Vehicle Type" 
              name="vehicleType" 
              value={form.vehicleType} 
              onChange={handleChange}
              options={[
                { label: 'Bike', value: 'bike' },
                { label: 'Scooter', value: 'scooter' },
                { label: 'Car', value: 'car' },
                { label: 'Van', value: 'van' },
              ]}
            />
            <Input 
              label="Vehicle Number" 
              name="vehicleNumber" 
              placeholder="e.g. MH12AB1234" 
              value={form.vehicleNumber} 
              onChange={handleChange} 
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={submitting}>Create Agent</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Remove Delivery Agent"
        message={`Are you sure you want to remove ${agentToDelete?.name}? They will lose access to the partner app.`}
        confirmLabel="Remove Agent"
        variant="danger"
      />
    </div>
  );
};

export default ManageDeliveryAgents;
