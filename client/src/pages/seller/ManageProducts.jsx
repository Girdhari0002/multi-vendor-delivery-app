import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaStar, FaBoxOpen } from 'react-icons/fa';

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'food', label: 'Food' },
  { value: 'books', label: 'Books' },
  { value: 'home', label: 'Home' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'sports', label: 'Sports' },
  { value: 'toys', label: 'Toys' },
  { value: 'other', label: 'Other' }
];

const STOCK_STATUS = [
  { value: 'all', label: 'All Status' },
  { value: 'in_stock', label: 'In Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' }
];

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, productId: null });
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products', { params: { limit: 1000 } });
      setProducts((data.products || []).filter(p => p.sellerId?._id === user._id || p.sellerId === user._id));
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchProducts();
  }, [user]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteDialog.productId}`);
      toast.success('Product deleted successfully');
      setProducts(prev => prev.filter(p => p._id !== deleteDialog.productId));
      setDeleteDialog({ isOpen: false, productId: null });
    } catch (error) {
      toast.error('Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
      const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
      const matchesStock = stockFilter === 'all' 
        ? true 
        : stockFilter === 'in_stock' ? p.stock > 0 : p.stock === 0;
      
      return matchesSearch && matchesCat && matchesStock;
    });
  }, [products, search, categoryFilter, stockFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Products</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track your product inventory ({products.length})</p>
        </div>
        <Link to="/seller/products/add">
          <Button icon={<FaPlus />} variant="primary">
            Add New Product
          </Button>
        </Link>
      </div>

      <Card padding="sm" className="bg-slate-50 border-none shadow-none">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon={<FaSearch />}
          />
          <Select
            options={CATEGORIES}
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          />
          <Select
            options={STOCK_STATUS}
            value={stockFilter}
            onChange={e => setStockFilter(e.target.value)}
          />
        </div>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card className="py-12">
          <EmptyState
            icon={FaBoxOpen}
            title={products.length === 0 ? "No products yet" : "No products found"}
            description={products.length === 0 ? "Start adding products to your store to get sales." : "Try adjusting your search or filters."}
            actionLabel={products.length === 0 ? "Add Product" : "Clear Filters"}
            onAction={() => products.length === 0 ? navigate('/seller/products/add') : (() => { setSearch(''); setCategoryFilter('all'); setStockFilter('all'); })()}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <Card key={product._id} padding="none" className="overflow-hidden flex flex-col hover:border-orange-200">
              <div className="h-48 overflow-hidden bg-slate-100 relative">
                <img 
                  src={product.image || 'https://via.placeholder.com/300?text=No+Image'} 
                  alt={product.title} 
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                  <Badge variant="neutral" className="bg-white/90 backdrop-blur shadow-sm capitalize">
                    {product.category}
                  </Badge>
                  {product.stock <= 0 && (
                    <Badge variant="danger" className="bg-white/90 backdrop-blur shadow-sm">
                      Out of Stock
                    </Badge>
                  )}
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="font-semibold text-slate-900 line-clamp-2" title={product.title}>
                    {product.title}
                  </h3>
                  <div className="flex items-center text-orange-500 text-sm font-medium bg-orange-50 px-2 py-0.5 rounded flex-shrink-0">
                    <FaStar className="mr-1" size={12} />
                    {product.rating ? product.rating.toFixed(1) : 'New'}
                  </div>
                </div>
                
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                  <div>
                    <div className="text-lg font-bold text-slate-900">₹{product.price}</div>
                    <div className="text-xs text-slate-500">Stock: <span className={product.stock > 0 ? "text-slate-700 font-medium" : "text-red-500 font-medium"}>{product.stock}</span></div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 !p-0 !rounded-full text-slate-400 hover:text-blue-500 hover:bg-blue-50"
                      onClick={() => navigate(`/seller/products/edit/${product._id}`)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 !p-0 !rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50"
                      onClick={() => setDeleteDialog({ isOpen: true, productId: product._id })}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, productId: null })}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default ManageProducts;
