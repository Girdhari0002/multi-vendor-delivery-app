import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import Spinner from '../../components/Spinner';
import { useAuth } from '../../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [wishlist, setWishlist] = useState([]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/products', {
        params: { keyword, category, sort, page, limit: 12 }
      });
      setProducts(data.products || []);
      setPages(data.pages || 1);
    } catch (error) {
      console.error(error);
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
    setPage(1);
  }, [keyword, category, sort]);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, category, sort, page]);

  useEffect(() => {
    fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const toggleWishlist = async (e, productId) => {
    e.preventDefault();
    if (!user) return toast.info('Please log in to save items to your wishlist');
    try {
      if (wishlist.includes(productId)) {
        await api.delete(`/users/wishlist/${productId}`);
        setWishlist((prev) => prev.filter((id) => id !== productId));
      } else {
        await api.post(`/users/wishlist/${productId}`);
        setWishlist((prev) => [...prev, productId]);
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-2 md:gap-4 bg-white p-2 md:p-4 rounded-lg shadow">
        <input
          type="text"
          placeholder="Search products..."
          className="flex-1 px-3 md:px-4 py-2 border rounded-md text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <select
          className="w-full md:w-auto px-3 md:px-4 py-2 border rounded-md text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
          <option value="food">Food</option>
          <option value="books">Books</option>
        </select>
        <select
          className="w-full md:w-auto px-3 md:px-4 py-2 border rounded-md text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
            {products.map(product => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 relative"
              >
                <button
                  onClick={(e) => toggleWishlist(e, product._id)}
                  className="absolute top-2 right-2 z-10 bg-white/90 rounded-full p-2 shadow hover:scale-110 transition"
                  title={wishlist.includes(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  {wishlist.includes(product._id) ? (
                    <FaHeart className="text-red-500" />
                  ) : (
                    <FaRegHeart className="text-gray-500" />
                  )}
                </button>
                <div className="relative bg-gray-100 h-40 sm:h-48 flex items-center justify-center">
                  <img
                    src={product.image || 'https://via.placeholder.com/300'}
                    alt={product.title}
                    className="w-full h-full object-contain p-2"
                  />
                </div>
                <div className="p-2 md:p-4">
                  <h3 className="text-xs md:text-sm lg:text-base font-semibold text-gray-800 truncate line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="text-gray-500 text-xs md:text-sm mt-1 truncate">{product.category}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm md:text-lg lg:text-xl font-bold text-blue-600">
                      ₹{product.price.toFixed(2)}
                    </span>
                    <div className="flex items-center space-x-1 text-yellow-500 text-xs md:text-sm">
                      <span>★</span>
                      <span className="font-semibold">{product.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <Link
                    to={`/product/${product._id}`}
                    className="mt-3 block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-3 rounded text-xs md:text-sm transition-colors duration-200"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-12 text-sm md:text-base">
                No products found.
              </div>
            )}
          </div>

          {pages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-md border text-sm bg-white disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">Page {page} of {pages}</span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, pages))}
                disabled={page === pages}
                className="px-3 py-1.5 rounded-md border text-sm bg-white disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
