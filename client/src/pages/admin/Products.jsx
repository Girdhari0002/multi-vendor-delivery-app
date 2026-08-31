import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { FaTrash } from 'react-icons/fa';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import SearchBar from '../../components/ui/SearchBar';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { SkeletonTable } from '../../components/ui/Skeleton';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, productId: null, loading: false });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/products', { params: { limit: 1000 } });
      setProducts(data.products || []);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async () => {
    setDeleteDialog(prev => ({ ...prev, loading: true }));
    try {
      await api.delete(`/admin/product/${deleteDialog.productId}`);
      toast.success('Product deleted by admin');
      setProducts(prev => prev.filter(p => p._id !== deleteDialog.productId));
    } catch (error) {
      toast.error('Failed to delete product');
    } finally {
      setDeleteDialog({ isOpen: false, productId: null, loading: false });
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Product',
      sortable: true,
      render: (_, p) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
            {p.image && <img src={p.image} alt={p.title} className="w-full h-full object-cover" />}
          </div>
          <div>
            <div className="font-medium text-slate-800 line-clamp-1">{p.title}</div>
            <div className="text-xs text-slate-500 font-mono">ID: {p._id.slice(-8)}</div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (val) => <Badge variant="info">{val || 'Uncategorized'}</Badge>
    },
    {
      key: 'seller',
      label: 'Seller',
      sortable: true,
      render: (_, p) => <span className="font-medium text-indigo-600">{p.sellerId?.name || p.sellerId?.businessName || 'Unknown'}</span>
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (val) => <span className="font-bold text-slate-900">₹{val}</span>
    },
    {
      key: 'stock',
      label: 'Stock',
      sortable: true,
      render: (val) => (
        <span className={val > 10 ? 'text-green-600 font-medium' : val > 0 ? 'text-amber-500 font-medium' : 'text-red-500 font-bold'}>
          {val || 0}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, p) => (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setDeleteDialog({ isOpen: true, productId: p._id, loading: false })} 
          icon={<FaTrash className="text-red-500" />} 
          title="Delete Product" 
        />
      )
    }
  ];

  const filteredProducts = products.filter(p => p.title?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Products Management</h2>
          <p className="text-slate-500 mt-1">Total {products.length} products across all vendors</p>
        </div>
        <div className="w-full md:w-72">
          <SearchBar 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder="Search products by name..." 
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <SkeletonTable rows={10} cols={6} />
        ) : (
          <DataTable 
            columns={columns} 
            data={filteredProducts} 
            pagination 
            pageSize={10} 
            emptyMessage={searchTerm ? 'No products match your search.' : 'No products found.'}
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, productId: null, loading: false })}
        onConfirm={handleDelete}
        loading={deleteDialog.loading}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        variant="danger"
        confirmLabel="Delete"
      />
    </div>
  );
};
export default AdminProducts;
