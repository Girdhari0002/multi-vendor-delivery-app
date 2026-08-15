import { useState, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';
import api from '../../api/axios';
import { toast } from 'react-toastify';

const emptyForm = {
  code: '', discountType: 'flat', discountValue: '', maxDiscount: '',
  minOrderValue: '', expiryDate: '', usageLimit: '',
};

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

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
    setSubmitting(true);
    try {
      const payload = {
        code: form.code,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        ...(form.maxDiscount && { maxDiscount: Number(form.maxDiscount) }),
        ...(form.minOrderValue && { minOrderValue: Number(form.minOrderValue) }),
        ...(form.expiryDate && { expiryDate: form.expiryDate }),
        ...(form.usageLimit && { usageLimit: Number(form.usageLimit) }),
      };
      await api.post('/coupons', payload);
      toast.success('Coupon created');
      setForm(emptyForm);
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
      toast.error('Failed to update coupon');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-2 md:p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Coupons</h1>
        <p className="text-gray-600 text-xs md:text-sm mb-6">Create and manage discount codes</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input name="code" required placeholder="CODE e.g. WELCOME50" value={form.code} onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          <select name="discountType" value={form.discountType} onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            <option value="flat">Flat (₹)</option>
            <option value="percent">Percent (%)</option>
          </select>
          <input name="discountValue" type="number" min="0" step="0.01" required placeholder="Discount value" value={form.discountValue} onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          <input name="maxDiscount" type="number" min="0" step="0.01" placeholder="Max discount cap (optional)" value={form.maxDiscount} onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          <input name="minOrderValue" type="number" min="0" step="0.01" placeholder="Min order value (optional)" value={form.minOrderValue} onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          <input name="usageLimit" type="number" min="1" placeholder="Usage limit (optional)" value={form.usageLimit} onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          <input name="expiryDate" type="date" placeholder="Expiry date (optional)" value={form.expiryDate} onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          <button type="submit" disabled={submitting}
            className="sm:col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg px-4 py-2 text-sm disabled:opacity-50">
            {submitting ? 'Creating...' : 'Create Coupon'}
          </button>
        </form>

        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          {loading ? (
            <p className="p-6 text-center text-gray-500">Loading...</p>
          ) : coupons.length === 0 ? (
            <p className="p-6 text-center text-gray-500">No coupons yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b-2 border-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Code</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Discount</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Min Order</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Used</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Expiry</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-700">Active</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="border-b border-gray-200 hover:bg-indigo-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">{coupon.code}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {coupon.discountType === 'percent' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                    </td>
                    <td className="px-4 py-3 text-gray-600">₹{coupon.minOrderValue || 0}</td>
                    <td className="px-4 py-3 text-gray-600">{coupon.usedCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}</td>
                    <td className="px-4 py-3 text-gray-600">{coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleActive(coupon)}
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${coupon.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {coupon.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleDelete(coupon._id)} className="text-red-600 hover:text-red-900" title="Delete">
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

export default Coupons;
