import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

const Payouts = () => {
  const [payouts, setPayouts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState('');
  const [commissionRate, setCommissionRate] = useState(10);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchData = async () => {
    try {
      const [payoutsRes, sellersRes] = await Promise.all([
        api.get('/admin/payouts'),
        api.get('/admin/sellers'),
      ]);
      setPayouts(payoutsRes.data);
      setSellers(sellersRes.data);
    } catch (error) {
      toast.error('Failed to load payouts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedSeller) return toast.error('Select a seller first');
    setGenerating(true);
    try {
      await api.post('/admin/payouts/generate', { sellerId: selectedSeller, commissionRate: Number(commissionRate) });
      toast.success('Payout generated');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate payout');
    } finally {
      setGenerating(false);
    }
  };

  const markPaid = async (id) => {
    if (!window.confirm('Confirm this payout has been paid out (e.g. via bank transfer)?')) return;
    try {
      await api.put(`/admin/payouts/${id}/pay`);
      toast.success('Payout marked as paid');
      fetchData();
    } catch (error) {
      toast.error('Failed to update payout');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-2 md:p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Seller Payouts</h1>
        <p className="text-gray-600 text-xs md:text-sm mb-6">Settle delivered orders and track payments to sellers</p>

        <form onSubmit={handleGenerate} className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6 flex flex-col sm:flex-row gap-3">
          <select value={selectedSeller} onChange={(e) => setSelectedSeller(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            <option value="">Select a seller...</option>
            {sellers.map((s) => (
              <option key={s._id} value={s._id}>{s.businessName || s.name}</option>
            ))}
          </select>
          <input type="number" min="0" max="100" value={commissionRate} onChange={(e) => setCommissionRate(e.target.value)}
            className="w-full sm:w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Commission %" />
          <button type="submit" disabled={generating}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg px-4 py-2 text-sm disabled:opacity-50 whitespace-nowrap">
            {generating ? 'Generating...' : 'Generate Payout'}
          </button>
        </form>

        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          {loading ? (
            <p className="p-6 text-center text-gray-500">Loading...</p>
          ) : payouts.length === 0 ? (
            <p className="p-6 text-center text-gray-500">No payouts generated yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b-2 border-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Seller</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Period</th>
                  <th className="px-4 py-3 text-right font-bold text-gray-700">Gross</th>
                  <th className="px-4 py-3 text-right font-bold text-gray-700">Commission</th>
                  <th className="px-4 py-3 text-right font-bold text-gray-700">Net Payable</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr key={payout._id} className="border-b border-gray-200 hover:bg-indigo-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">{payout.sellerId?.businessName || payout.sellerId?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {new Date(payout.periodStart).toLocaleDateString()} – {new Date(payout.periodEnd).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">₹{payout.grossAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-gray-500">₹{payout.commissionAmount.toFixed(2)} ({payout.commissionRate}%)</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">₹{payout.netPayable.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${payout.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {payout.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {payout.status === 'pending' && (
                        <button onClick={() => markPaid(payout._id)} className="text-indigo-600 hover:text-indigo-900 font-semibold text-xs underline">
                          Mark Paid
                        </button>
                      )}
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

export default Payouts;
