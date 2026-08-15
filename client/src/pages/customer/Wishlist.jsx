import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaHeart } from 'react-icons/fa';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';

const Wishlist = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const { data } = await api.get('/users/wishlist');
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const remove = async (productId) => {
    try {
      await api.delete(`/users/wishlist/${productId}`);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="bg-white shadow rounded-lg p-4 md:p-6">
      <h2 className="text-2xl font-bold mb-6">My Wishlist</h2>
      {products.length === 0 ? (
        <p className="text-gray-500">Your wishlist is empty. Tap the heart icon on any product to save it here.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <div key={product._id} className="border rounded-lg overflow-hidden hover:shadow-md transition relative">
              <button
                onClick={() => remove(product._id)}
                className="absolute top-2 right-2 z-10 bg-white/90 rounded-full p-2 shadow hover:scale-110 transition"
                title="Remove from wishlist"
              >
                <FaHeart className="text-red-500" />
              </button>
              <div className="bg-gray-100 h-40 flex items-center justify-center">
                <img src={product.image} alt={product.title} className="w-full h-full object-contain p-2" />
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-800 truncate">{product.title}</h3>
                <p className="text-blue-600 font-bold mt-1">₹{product.price?.toFixed(2)}</p>
                <Link
                  to={`/product/${product._id}`}
                  className="mt-2 block text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-3 rounded text-xs transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
