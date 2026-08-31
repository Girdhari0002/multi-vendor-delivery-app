import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { FaMoneyBillWave, FaWallet, FaChartLine, FaCheck } from 'react-icons/fa';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonTable } from '../../components/ui/Skeleton';

const Payouts = () => {
  const [payouts, setPayouts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState('');
  const [commissionRate, setCommissionRate] = useState(10);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [confirmPayOpen, setConfirmPayOpen] = useState(false);
  const [payoutToPay, setPayoutToPay] = useState(null);

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
      toast.success('Payout generated successfully');
      setSelectedSeller('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate payout');
    } finally {
      setGenerating(false);
    }
  };

  const markPaid = async () => {
    if (!payoutToPay) return;
    try {
      await api.put(`/admin/payouts/${payoutToPay._id}/pay`);
      toast.success('Payout marked as paid');
      fetchData();
      setConfirmPayOpen(false);
    } catch (error) {
      toast.error('Failed to update payout');
    }
  };

  const totalGross = payouts.reduce((sum, p) => sum + (p.grossAmount || 0), 0);
  const totalCommission = payouts.reduce((sum, p) => sum + (p.commissionAmount || 0), 0);
  const totalNet = payouts.reduce((sum, p) => sum + (p.netPayable || 0), 0);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Seller Payouts</h1>
          <p className="text-slate-500 text-sm">Generate and manage financial settlements for sellers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Gross Sales" 
          value={`₹${totalGross.toFixed(2)}`} 
          icon={FaChartLine} 
          color="info" 
        />
        <StatCard 
          title="Platform Commission" 
          value={`₹${totalCommission.toFixed(2)}`} 
          icon={FaWallet} 
          color="success" 
        />
        <StatCard 
          title="Net Paid/Payable" 
          value={`₹${totalNet.toFixed(2)}`} 
          icon={FaMoneyBillWave} 
          color="primary" 
        />
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Generate Payout</h3>
        <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <Select 
              label="Select Seller"
              value={selectedSeller}
              onChange={(e) => setSelectedSeller(e.target.value)}
              options={sellers.map(s => ({ label: s.businessName || s.name, value: s._id }))}
              placeholder="Select a seller to generate payout..."
            />
          </div>
          <div className="w-full md:w-48">
            <Input 
              label="Commission Rate (%)"
              type="number"
              min="0"
              max="100"
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              required
            />
          </div>
          <Button type="submit" variant="primary" loading={generating} className="w-full md:w-auto h-[42px] mt-6 md:mt-0">
            Generate Payout
          </Button>
        </form>
      </Card>

      <Card padding="none" className="overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-semibold text-slate-800">Payout History</h3>
        </div>
        
        {loading ? (
          <div className="p-4"><SkeletonTable rows={4} cols={6} /></div>
        ) : payouts.length === 0 ? (
          <EmptyState 
            title="No payouts generated" 
            description="Generate a payout for a seller to see it listed here." 
            icon={FaWallet}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-medium">Seller</th>
                  <th className="px-6 py-3 font-medium">Period</th>
                  <th className="px-6 py-3 font-medium text-right">Gross Amount</th>
                  <th className="px-6 py-3 font-medium text-right">Commission</th>
                  <th className="px-6 py-3 font-medium text-right">Net Payable</th>
                  <th className="px-6 py-3 font-medium text-center">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {payouts.map((payout) => (
                  <tr key={payout._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-800">
                      {payout.sellerId?.businessName || payout.sellerId?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs">
                      {new Date(payout.periodStart).toLocaleDateString()} - <br/>{new Date(payout.periodEnd).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-slate-600">
                      ₹{(payout.grossAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-slate-500">
                      ₹{(payout.commissionAmount || 0).toFixed(2)} <span className="text-xs">({payout.commissionRate}%)</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-slate-900 bg-slate-50/50">
                      ₹{(payout.netPayable || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Badge variant={payout.status === 'paid' ? 'success' : 'warning'}>
                        {payout.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {payout.status === 'pending' ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => { setPayoutToPay(payout); setConfirmPayOpen(true); }}
                        >
                          Mark Paid
                        </Button>
                      ) : (
                        <span className="inline-flex items-center text-emerald-600 font-medium text-sm gap-1">
                          <FaCheck /> Paid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmDialog 
        isOpen={confirmPayOpen}
        onClose={() => setConfirmPayOpen(false)}
        onConfirm={markPaid}
        title="Mark Payout as Paid"
        message={`Are you sure you want to mark the payout of ₹${(payoutToPay?.netPayable || 0).toFixed(2)} for ${payoutToPay?.sellerId?.businessName || 'the seller'} as paid? Ensure you have transferred the funds manually before confirming.`}
        confirmLabel="Confirm Payment"
        variant="success"
      />
    </div>
  );
};

export default Payouts;
