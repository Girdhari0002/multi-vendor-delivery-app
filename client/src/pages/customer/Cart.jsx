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
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Your Cart</h2>
      
      {!cart || cart.items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Your cart is empty.</p>
          <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">Continue Shopping</Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <ul className="divide-y border-b border-t">
              {cart.items.map(item => item.productId && (
                <li key={item.productId._id} className="py-6 flex hover:bg-gray-50 px-4 -mx-4 transition-colors">
                  <img src={item.productId.image} alt="" className="w-24 h-24 object-cover rounded-md" />
                  <div className="ml-4 flex-1 flex flex-col justify-between">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.productId.title}</h3>
                        <p className="text-blue-600 font-bold mt-1">₹{item.productId.price}</p>
                      </div>
                      <button onClick={() => removeItem(item.productId._id)} className="text-red-500 hover:underline text-sm font-medium">Remove</button>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <label className="text-sm text-gray-500">Qty:</label>
                      <select 
                        value={item.quantity} 
                        onChange={(e) => updateQuantity(item.productId._id, Number(e.target.value))}
                        className="border rounded p-1 max-w-[80px]"
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
          
          <div className="lg:w-80 bg-gray-50 p-6 rounded-lg h-fit">
            <h3 className="text-lg font-bold border-b pb-4 mb-4">Order Summary</h3>
            <div className="flex justify-between mb-4">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-6 border-b pb-4">
              <span className="text-gray-600">Shipping</span>
              <span className="font-semibold">Free</span>
            </div>
            <div className="flex justify-between mb-8 text-xl font-bold text-gray-900">
              <span>Total</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <button 
              onClick={() => navigate('/checkout', { state: { cart, subtotal } })}
              className="w-full bg-blue-600 text-white py-3 rounded-md font-bold hover:bg-blue-700 shadow-lg"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
