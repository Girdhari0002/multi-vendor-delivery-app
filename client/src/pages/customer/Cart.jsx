import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Spinner from '../../components/Spinner';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const { data } = await api.get('/cart');
      setCart(data);
    } catch (error) {
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const removeItem = async (productId) => {
    try {
      await api.delete('/cart/remove', { data: { productId } });
      fetchCart();
      toast.success('Item removed');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await api.post('/cart/add', { productId, quantity });
      fetchCart();
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  if (loading) return <Spinner />;

  const subtotal = cart?.items.reduce((acc, item) => acc + (item.productId?.price * item.quantity), 0) || 0;

  return (
    <div className="bg-white shadow rounded-lg p-2 sm:p-4 md:p-6">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 md:mb-6">Your Cart</h2>

      {!cart || cart.items.length === 0 ? (
        <div className="text-center py-8 md:py-12">
          <p className="text-gray-500 text-base md:text-lg">Your cart is empty.</p>
          <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block text-sm md:text-base">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
          {/* Cart Items */}
          <div className="flex-1 w-full">
            <ul className="divide-y border-b border-t">
              {cart.items.map(item => item.productId && (
                <li key={item.productId._id} className="py-3 md:py-6 flex flex-col sm:flex-row hover:bg-gray-50 px-2 md:px-4 -mx-2 md:-mx-4 transition-colors gap-3">
                  <img
                    src={item.productId.image}
                    alt=""
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md flex-shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">
                          {item.productId.title}
                        </h3>
                        <p className="text-blue-600 font-bold mt-1 text-sm md:text-base">
                          ₹{item.productId.price}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId._id)}
                        className="text-red-500 hover:underline text-xs md:text-sm font-medium self-start sm:self-auto"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2 md:mt-3">
                      <label className="text-xs md:text-sm text-gray-500">Qty:</label>
                      <select
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.productId._id, Number(e.target.value))}
                        className="border rounded px-2 py-1 text-xs md:text-sm max-w-[80px]"
                      >
                        {[...Array(Math.min(10, item.productId.stock)).keys()].map(x => (
                          <option key={x+1} value={x+1}>{x+1}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-80 bg-gray-50 p-3 md:p-6 rounded-lg h-fit border border-gray-200 lg:border-none">
            <h3 className="text-base md:text-lg font-bold border-b pb-3 md:pb-4 mb-3 md:mb-4">
              Order Summary
            </h3>
            <div className="space-y-2 md:space-y-3 mb-3 md:mb-4">
              <div className="flex justify-between text-sm md:text-base text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm md:text-base text-gray-600 border-b pb-3 md:pb-4">
                <span>Shipping</span>
                <span className="font-semibold">Free</span>
              </div>
            </div>
            <div className="flex justify-between mb-6 md:mb-8 text-base md:text-lg font-bold text-gray-900">
              <span>Total</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <button
              onClick={() => navigate('/checkout', { state: { cart, subtotal } })}
              className="w-full bg-blue-600 text-white py-2 md:py-3 rounded-md font-bold hover:bg-blue-700 shadow-lg text-sm md:text-base transition"
            >
              Proceed to Checkout
            </button>
            <Link
              to="/"
              className="block text-center mt-3 text-blue-600 hover:underline text-xs md:text-sm"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
