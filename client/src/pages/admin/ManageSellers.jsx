import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { FaTrash, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import SearchBar from '../../components/ui/SearchBar';
import StatCard from '../../components/ui/StatCard';

export default function ManageSellers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, sellerId: null, loading: false });
  const navigate = useNavigate();

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/sellers');
      setSellers(data);
    } catch (error) {
      toast.error('Failed to load sellers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const filteredAndSortedSellers = useMemo(() => {
    let filtered = sellers;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(s => s.storeStatus === filterStatus);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        (s.businessName || '').toLowerCase().includes(term) ||
        (s.name || '').toLowerCase().includes(term) ||
        (s.email || '').toLowerCase().includes(term)
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === 'name') return (a.businessName || a.name || '').localeCompare(b.businessName || b.name || '');
      if (sortBy === 'revenue') return (b.totalRevenue || 0) - (a.totalRevenue || 0);
      if (sortBy === 'orders') return (b.orderCount || 0) - (a.orderCount || 0);
      if (sortBy === 'products') return (b.productCount || 0) - (a.productCount || 0);
      return new Date(b.createdAt) - new Date(a.createdAt); // date
    });

    return filtered;
  }, [sellers, searchTerm, filterStatus, sortBy]);

  const handleDelete = async () => {
    setDeleteDialog(prev => ({ ...prev, loading: true }));
    try {
      await api.delete(`/admin/sellers/${deleteDialog.sellerId}`);
      toast.success('Seller deleted successfully');
      setSellers(prev => prev.filter(s => s._id !== deleteDialog.sellerId));
    } catch (error) {
      toast.error('Failed to delete seller');
    } finally {
      setDeleteDialog({ isOpen: false, sellerId: null, loading: false });
    }
  };

  const columns = [
    {
      key: 'businessName',
      label: 'Store',
      render: (_, seller) => (
        <div className="flex items-center gap-3">
          <Avatar src={seller.storeLogo} name={seller.businessName || seller.name} size="md" />
          <div>
            <div className="font-semibold text-slate-900">{seller.businessName || seller.name || 'N/A'}</div>
            <div className="text-xs text-slate-500">{seller.name}</div>
          </div>
        </div>
      )
    },
    {
      key: 'productCount',
      label: 'Products',
      render: (val) => <span className="font-medium text-slate-700">{val || 0}</span>
    },
    {
      key: 'orderCount',
      label: 'Orders',
      render: (val) => <span className="font-medium text-slate-700">{val || 0}</span>
    },
    {
      key: 'totalRevenue',
      label: 'Revenue',
      render: (val) => <span className="font-bold text-slate-900">₹{(val || 0).toLocaleString('en-IN')}</span>
    },
    {
      key: 'storeStatus',
      label: 'Status',
      render: (val) => (
        <Badge variant={val === 'active' ? 'success' : 'danger'} dot>
          {val === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, seller) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/sellers/${seller._id}`)} icon={<FaEye />} title="View Details" />
          <Button variant="ghost" size="sm" onClick={() => setDeleteDialog({ isOpen: true, sellerId: seller._id, loading: false })} icon={<FaTrash className="text-red-500"/>} title="Delete Seller" />
        </div>
      )
    }
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Manage Sellers</h1>
        <p className="text-slate-500 mt-1">View, manage, and monitor all sellers on the platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard title="Total Sellers" value={filteredAndSortedSellers.length} color="primary" />
        <StatCard title="Total Products" value={filteredAndSortedSellers.reduce((a, b) => a + (b.productCount || 0), 0)} color="info" />
        <StatCard title="Total Revenue" value={`₹${filteredAndSortedSellers.reduce((a, b) => a + (b.totalRevenue || 0), 0).toLocaleString('en-IN')}`} color="purple" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-1/3">
          <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search sellers..." />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
          >
            <option value="name">Sort by Name</option>
            <option value="revenue">Sort by Revenue</option>
            <option value="orders">Sort by Orders</option>
            <option value="products">Sort by Products</option>
            <option value="date">Sort by Date</option>
          </select>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={filteredAndSortedSellers} 
        loading={loading} 
        pagination 
        pageSize={10} 
        emptyMessage="No sellers found."
      />

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, sellerId: null, loading: false })}
        onConfirm={handleDelete}
        loading={deleteDialog.loading}
        title="Delete Seller"
        message="Are you sure you want to delete this seller and all their products/orders? This action cannot be undone."
        variant="danger"
        confirmLabel="Delete"
      />
    </div>
  );
}
