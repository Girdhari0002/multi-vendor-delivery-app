import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { FaMoneyBillWave, FaClock, FaPercent, FaWallet } from 'react-icons/fa';

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

  // Calculate stats
  const totalEarnings = payouts.reduce((sum, p) => p.status === 'paid' ? sum + p.netPayable : sum, 0);
  const pendingAmount = payouts.reduce((sum, p) => p.status !== 'paid' ? sum + p.netPayable : sum, 0);
  const totalCommission = payouts.reduce((sum, p) => sum + p.commissionAmount, 0);

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800">Financial Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl h-32 animate-pulse" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl h-24 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Payouts & Earnings</h1>
          <p className="text-slate-500">Manage your store's finances and track your payouts.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Paid Earnings"
            value={`₹${totalEarnings.toFixed(2)}`}
            icon={FaMoneyBillWave}
            color="success"
          />
          <StatCard
            title="Pending Payouts"
            value={`₹${pendingAmount.toFixed(2)}`}
            icon={FaClock}
            color="warning"
          />
          <StatCard
            title="Total Commission Paid"
            value={`₹${totalCommission.toFixed(2)}`}
            icon={FaPercent}
            color="primary"
          />
        </div>

        {/* Payouts List */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4">Payout History</h2>
          
          {payouts.length === 0 ? (
            <Card>
              <EmptyState 
                icon={FaWallet}
                title="No Payouts Yet" 
                description="Once your store starts generating sales, your payout details will appear here." 
              />
            </Card>
          ) : (
            <div className="space-y-4">
              {payouts.map((payout) => (
                <Card key={payout._id} hover padding="md" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-700">
                        Period:
                      </span>
                      <span className="text-sm text-slate-600">
                        {new Date(payout.periodStart).toLocaleDateString()} – {new Date(payout.periodEnd).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                      <span>Gross: <strong className="text-slate-700">₹{payout.grossAmount.toFixed(2)}</strong></span>
                      <span className="hidden sm:inline text-slate-300">|</span>
                      <span>Commission ({payout.commissionRate}%): <strong className="text-slate-700">₹{payout.commissionAmount.toFixed(2)}</strong></span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="flex flex-col md:items-end">
                      <span className="text-xs text-slate-500 font-medium mb-1">Net Payable</span>
                      <span className="text-2xl font-bold text-orange-500">
                        ₹{payout.netPayable.toFixed(2)}
                      </span>
                    </div>
                    <Badge 
                      variant={payout.status === 'paid' ? 'success' : 'warning'} 
                      dot
                      className="capitalize"
                    >
                      {payout.status}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerPayouts;
