import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import Spinner from '../../components/Spinner';

const SellerPayouts = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const { data } = await api.get('/sellers/payouts');
        setPayouts(data);
      } catch (error) {
        toast.error('Failed to load payouts');
      } finally {
        setLoading(false);
      }
    };
    fetchPayouts();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="bg-white shadow rounded-lg p-4 md:p-6">
      <h2 className="text-2xl font-bold mb-6">My Payouts</h2>
      {payouts.length === 0 ? (
        <p className="text-gray-500">No payouts have been settled yet.</p>
      ) : (
        <div className="space-y-3">
          {payouts.map((payout) => (
            <div key={payout._id} className="border rounded-lg p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div>
                <p className="text-xs text-gray-400">
                  {new Date(payout.periodStart).toLocaleDateString()} – {new Date(payout.periodEnd).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">Gross: ₹{payout.grossAmount.toFixed(2)} • Commission: ₹{payout.commissionAmount.toFixed(2)} ({payout.commissionRate}%)</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg text-blue-600">₹{payout.netPayable.toFixed(2)}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${payout.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {payout.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerPayouts;
