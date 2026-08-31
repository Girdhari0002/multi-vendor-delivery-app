import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaHeartBroken, FaHeart, FaShoppingCart } from 'react-icons/fa';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { useCart } from '../../context/CartContext';

const Wishlist = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

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
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleAddToCart = async (product) => {
    await addToCart(product._id, 1);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-8 bg-slate-200 rounded w-48 mb-8 animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-80 bg-slate-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          My Wishlist <span className="text-slate-500 text-lg font-normal ml-2">({products.length})</span>
        </h1>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={FaHeart}
          title="Your wishlist is empty"
          description="Save items you love here and purchase them later when you're ready."
          actionLabel="Browse Products"
          onAction={() => window.location.href = '/'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product._id} hover padding="none" className="flex flex-col group overflow-hidden">
              <div className="relative aspect-square bg-slate-50 flex items-center justify-center p-4">
                <img 
                  src={product.image || 'https://via.placeholder.com/200'} 
                  alt={product.title} 
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" 
                />
                <button
                  onClick={() => remove(product._id)}
                  className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-sm text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors z-10"
                  title="Remove from wishlist"
                >
                  <FaHeartBroken size={18} />
                </button>
              </div>
              
              <div className="p-4 flex flex-col flex-1">
                <Link to={`/product/${product._id}`} className="mb-2 hover:text-orange-500 transition-colors">
                  <h3 className="text-slate-800 font-medium line-clamp-2 min-h-[2.5rem]">
                    {product.title}
                  </h3>
                </Link>
                
                <div className="mt-auto pt-4 space-y-4">
                  <div className="font-bold text-lg text-slate-900">
                    ₹{product.price?.toFixed(2)}
                  </div>
                  
                  <Button 
                    fullWidth 
                    icon={<FaShoppingCart />}
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
