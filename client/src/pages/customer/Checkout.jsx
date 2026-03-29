import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const Checkout = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!state?.cart) {
      navigate('/cart');
    }
  }, [state, navigate]);

  const handlePayment = async () => {
    if (!address.trim()) {
      return toast.error('Please enter a delivery address');
    }

    setLoading(true);
    try {
      // 1. Create order in DB (Pending state)
      const items = state.cart.items.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.productId.price
      }));

      const { data: orderDB } = await api.post('/orders', {
        items,
        deliveryAddress: address,
        totalAmount: state.subtotal
      });

      // 2. Create Razorpay order
      const { data: { id: razorpayOrderId } } = await api.post('/payment/create-order', {
        amount: state.subtotal
      });

      

      // 3. Open Razorpay widget
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // In production, use your actual key from backend/env
        amount: state.subtotal * 100,
        currency: "INR",
        name: "Delivery App",
        description: "Test Transaction",
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderDB._id
            });
            toast.success('Payment successful!');
            navigate('/customer/orders');
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#2563eb",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast.error('Could not initiate payment');
    } finally {
      setLoading(false);
    }
  };

  if (!state?.cart) return null;

  return (
    <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Checkout</h2>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Delivery Address</h3>
        <textarea 
          className="w-full border p-3 rounded focus:ring focus:ring-blue-300" 
          rows="3" 
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter full address..."
        ></textarea>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h3 className="text-lg font-semibold border-b pb-4 mb-4">Order Summary</h3>
        <ul className="space-y-4 mb-4">
          {state.cart.items.map(item => (
            <li key={item.productId._id} className="flex justify-between text-gray-700">
              <span>{item.quantity} x {item.productId.title}</span>
              <span>₹{(item.productId.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between font-bold text-xl border-t pt-4">
          <span>Total</span>
          <span>₹{state.subtotal.toFixed(2)}</span>
        </div>
      </div>

      <button 
        onClick={handlePayment} 
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-md font-bold text-lg hover:bg-green-700 transition"
      >
        {loading ? 'Processing...' : 'Pay with Razorpay'}
      </button>
    </div>
  );
};

export default Checkout;
