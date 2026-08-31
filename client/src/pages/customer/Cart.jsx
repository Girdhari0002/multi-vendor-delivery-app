import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { FaTrash, FaShoppingCart } from 'react-icons/fa';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import clsx from 'clsx';

const Cart = () => {
  const { cartItems, cartTotal, cartCount, loading, updateCartItem, removeFromCart } = useCart();
  const navigate = useNavigate();

  if (loading && cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-48 mb-8"></div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
          <div className="w-full lg:w-96">
            <div className="h-64 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={FaShoppingCart}
          title="Your cart is empty"
          description="Looks like you haven't added anything to your cart yet."
          actionLabel="Start Shopping"
          onAction={() => navigate('/')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items List */}
        <div className="flex-1">
          <div className="space-y-4">
            {cartItems.map((item) => {
              if (!item.productId) return null;
              
              const product = item.productId;
              const maxQuantity = Math.min(10, product.stock || 10);
              const itemTotal = product.price * item.quantity;

              return (
                <Card key={product._id} padding="sm" className="flex flex-col sm:flex-row gap-4 relative overflow-hidden group">
                  {/* Product Image */}
                  <div className="w-full sm:w-24 sm:h-24 shrink-0 bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center">
                    <img 
                      src={product.image || 'https://via.placeholder.com/150'} 
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <Link to={`/product/${product._id}`} className="font-semibold text-slate-800 hover:text-orange-500 line-clamp-1">
                          {product.title}
                        </Link>
                        {product.seller?.name && (
                          <p className="text-sm text-slate-500 mt-0.5">Sold by: {product.seller.name}</p>
                        )}
                        <p className="font-medium text-slate-800 mt-1">₹{product.price?.toFixed(2)}</p>
                      </div>

                      <button
                        onClick={() => removeFromCart(product._id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                        title="Remove item"
                      >
                        <FaTrash />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity Control */}
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() => updateCartItem(product._id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || loading}
                          className="px-3 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        >
                          -
                        </button>
                        <span className="px-4 py-1 font-medium text-sm border-x border-slate-200 min-w-[3rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartItem(product._id, item.quantity + 1)}
                          disabled={item.quantity >= maxQuantity || loading}
                          className="px-3 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        >
                          +
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="font-bold text-slate-900">
                        ₹{itemTotal.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-96">
          <div className="sticky top-24">
            <Card padding="lg" className="border-orange-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Items ({cartCount})</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="text-emerald-500 font-medium">Free</span>
                </div>
                
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center text-lg font-bold text-slate-900">
                    <span>Subtotal</span>
                    <span>₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Taxes calculated at checkout</p>
                </div>
              </div>

              <Button 
                fullWidth 
                size="lg" 
                onClick={() => navigate('/checkout', { state: { cart: { items: cartItems }, subtotal: cartTotal } })}
              >
                Proceed to Checkout
              </Button>
              
              <div className="mt-4 text-center">
                <Link to="/" className="text-sm font-medium text-orange-500 hover:text-orange-600">
                  Continue Shopping
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
