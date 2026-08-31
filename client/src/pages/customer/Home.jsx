import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import { FaHeart, FaRegHeart, FaStar, FaShoppingCart, FaSearch } from 'react-icons/fa';
import Card from '../../components/ui/Card';
import { SkeletonCard } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const categories = [
  { id: '', name: 'All', icon: '🛒' },
  { id: 'food', name: 'Food', icon: '🍕' },
  { id: 'electronics', name: 'Electronics', icon: '📱' },
  { id: 'clothing', name: 'Clothing', icon: '👕' },
  { id: 'books', name: 'Books', icon: '📚' },
  { id: 'other', name: 'Other', icon: '🛍️' },
];

const Home = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [wishlist, setWishlist] = useState([]);

  // Extract from URL or set defaults
  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/products', {
        params: { keyword, category, sort, page, limit: 12 }
      });
      setProducts(data.products || []);
      setPages(data.pages || 1);
      setTotalCount(data.total || (data.products ? data.products.length : 0));
    } catch (error) {
      console.error(error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    if (!user || user.role !== 'customer') return;
    try {
      const { data } = await api.get('/users/wishlist');
      setWishlist(data.map((p) => p._id));
    } catch (error) {
      // Non-critical
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, category, sort, page]);

  useEffect(() => {
    fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    // Reset to page 1 on filter change, unless we're specifically changing the page
    if (!updates.page) {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const form = e.target;
    const kw = form.keyword.value;
    updateParams({ keyword: kw });
  };

  const toggleWishlist = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return toast.info('Please log in to save items to your wishlist');
    try {
      if (wishlist.includes(productId)) {
        await api.delete(`/users/wishlist/${productId}`);
        setWishlist((prev) => prev.filter((id) => id !== productId));
        toast.success('Removed from wishlist');
      } else {
        await api.post(`/users/wishlist/${productId}`);
        setWishlist((prev) => [...prev, productId]);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  const handleAddToCart = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return navigate('/login');
    addToCart(productId, 1);
  };

  return (
    <div className="space-y-8 pb-10 bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-orange-500 to-slate-900 text-white shadow-xl">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="relative z-10 px-6 py-12 md:py-20 md:px-12 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-md">
            Deliver Anything, Anywhere
          </h1>
          <p className="text-lg md:text-xl text-orange-50 max-w-2xl mb-8 drop-shadow">
            Your favorite food, electronics, and essentials delivered right to your door in minutes.
          </p>
          
          <form onSubmit={handleSearch} className="w-full max-w-2xl relative shadow-lg">
            <div className="flex bg-white rounded-full p-1 overflow-hidden focus-within:ring-2 focus-within:ring-orange-400">
              <span className="flex items-center pl-4 pr-2 text-slate-400">
                <FaSearch />
              </span>
              <input
                type="text"
                name="keyword"
                defaultValue={keyword}
                placeholder="Search for products, restaurants, or categories..."
                className="flex-1 py-3 px-2 text-slate-800 focus:outline-none bg-transparent w-full"
              />
              <Button type="submit" variant="primary" className="rounded-full px-6 whitespace-nowrap">
                Search
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Category Section */}
      <section className="px-2">
        <div className="flex overflow-x-auto pb-4 pt-2 gap-3 md:gap-4 no-scrollbar items-center md:justify-center">
          {categories.map((cat) => {
            const isActive = category === cat.id;
            return (
              <button
                key={cat.name}
                onClick={() => updateParams({ category: cat.id })}
                className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all duration-200 border shadow-sm ${
                  isActive
                    ? 'bg-orange-500 text-white border-orange-500 shadow-orange-500/30'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300 hover:shadow-md'
                }`}
              >
                <span className="text-xl">{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Filters Bar */}
      <section className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 px-6 gap-4">
        <div className="text-slate-600 font-medium">
          Showing {products.length > 0 ? products.length : 0} {totalCount > 0 ? `of ${totalCount}` : ''} results
          {keyword && <span className="ml-2 font-normal text-slate-500">for "{keyword}"</span>}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label htmlFor="sort-select" className="text-sm font-medium text-slate-600 whitespace-nowrap">
            Sort by:
          </label>
          <select
            id="sort-select"
            className="w-full sm:w-auto px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-700 font-medium cursor-pointer"
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value })}
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </section>

      {/* Product Grid */}
      <section>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState 
            title="No products found" 
            description="Try adjusting your search or filter criteria." 
            actionLabel="Clear Filters"
            onAction={() => navigate('/')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link to={`/product/${product._id}`} key={product._id} className="block group">
                <Card className="h-full flex flex-col relative overflow-hidden group-hover:border-orange-200" padding="none" hover>
                  <button
                    onClick={(e) => toggleWishlist(e, product._id)}
                    className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-sm hover:shadow-md hover:scale-110 transition-all border border-slate-100"
                    title={wishlist.includes(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    {wishlist.includes(product._id) ? (
                      <FaHeart className="text-red-500 text-lg" />
                    ) : (
                      <FaRegHeart className="text-slate-400 text-lg hover:text-red-500 transition-colors" />
                    )}
                  </button>
                  
                  <div className="relative h-56 bg-slate-100 flex items-center justify-center p-6 overflow-hidden">
                    <img
                      src={product.image || 'https://via.placeholder.com/300'}
                      alt={product.title}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="text-base font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
                        {product.title}
                      </h3>
                    </div>
                    
                    <p className="text-sm text-slate-500 mb-3 truncate">
                      {product.sellerId?.name || 'Unknown Seller'}
                    </p>
                    
                    <div className="mt-auto">
                      <div className="flex items-center gap-1.5 mb-3">
                        <FaStar className="text-amber-500 text-sm" />
                        <span className="text-sm font-semibold text-slate-700">{product.rating.toFixed(1)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xl font-extrabold text-slate-900">
                          ₹{product.price.toFixed(2)}
                        </span>
                        
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="!rounded-full px-4 shadow-sm hover:shadow"
                          onClick={(e) => handleAddToCart(e, product._id)}
                        >
                          <FaShoppingCart className="mr-1.5" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Pagination */}
      {!loading && pages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-6">
          <Button
            variant="outline"
            onClick={() => updateParams({ page: Math.max(page - 1, 1).toString() })}
            disabled={page === 1}
            className="rounded-lg shadow-sm"
          >
            Previous
          </Button>
          <div className="flex gap-1 px-4">
            {Array.from({ length: pages }).map((_, i) => (
              <button
                key={i}
                onClick={() => updateParams({ page: (i + 1).toString() })}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                  page === i + 1 
                    ? 'bg-orange-500 text-white shadow-md' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() => updateParams({ page: Math.min(page + 1, pages).toString() })}
            disabled={page === pages}
            className="rounded-lg shadow-sm"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default Home;
