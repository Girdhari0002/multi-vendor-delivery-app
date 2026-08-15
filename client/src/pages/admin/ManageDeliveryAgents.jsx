import { useState, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';
import api from '../../api/axios';
import { toast } from 'react-toastify';

const emptyForm = { name: '', email: '', password: '', phone: '', vehicleType: '', vehicleNumber: '' };

const ManageDeliveryAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

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
      toast.success('Delivery agent created');
      setForm(emptyForm);
      fetchAgents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create delivery agent');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this delivery agent?')) return;
    try {
      await api.delete(`/admin/delivery-agents/${id}`);
      toast.success('Delivery agent removed');
      fetchAgents();
    } catch (error) {
      toast.error('Failed to remove delivery agent');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-2 md:p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Manage Delivery Agents</h1>
        <p className="text-gray-600 text-xs md:text-sm mb-6">Create and manage delivery partner accounts</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input name="name" required placeholder="Full name" value={form.name} onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          <input name="email" type="email" required placeholder="Email" value={form.email} onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          <input name="password" type="password" required minLength={6} placeholder="Password" value={form.password} onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          <input name="vehicleType" placeholder="Vehicle type (e.g. Bike)" value={form.vehicleType} onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          <input name="vehicleNumber" placeholder="Vehicle number" value={form.vehicleNumber} onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          <button type="submit" disabled={submitting}
            className="sm:col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg px-4 py-2 text-sm disabled:opacity-50">
            {submitting ? 'Creating...' : 'Create Delivery Agent'}
          </button>
        </form>

        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          {loading ? (
            <p className="p-6 text-center text-gray-500">Loading...</p>
          ) : agents.length === 0 ? (
            <p className="p-6 text-center text-gray-500">No delivery agents yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b-2 border-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Phone</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Vehicle</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <tr key={agent._id} className="border-b border-gray-200 hover:bg-indigo-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">{agent.name}</td>
                    <td className="px-4 py-3 text-gray-600">{agent.email}</td>
                    <td className="px-4 py-3 text-gray-600">{agent.phone || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-600">{agent.vehicleType || 'N/A'} {agent.vehicleNumber}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleDelete(agent._id)} className="text-red-600 hover:text-red-900" title="Remove">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageDeliveryAgents;
