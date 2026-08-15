import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { FaCreditCard, FaTruck } from 'react-icons/fa';

const Checkout = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'razorpay'
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [settings, setSettings] = useState({ deliveryCharge: 50, codCharge: 20, codAvailable: true });
  const COD_CHARGE = settings.codCharge;
  const DELIVERY_CHARGE = settings.deliveryCharge;

  useEffect(() => {
    if (!state?.cart) {
      navigate('/cart');
    }
  }, [state, navigate]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        setSettings(data);
        if (!data.codAvailable) setPaymentMethod('razorpay');
      } catch (error) {
        // Falls back to the defaults above if this fails
      }
    };
    fetchSettings();
  }, []);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await api.post('/coupons/validate', {
        code: couponCode.trim(),
        orderTotal: state.subtotal,
      });
      setAppliedCoupon(data);
      toast.success(`Coupon applied! You saved ₹${data.discount.toFixed(2)}`);
    } catch (error) {
      setAppliedCoupon(null);
      toast.error(error.response?.data?.message || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handlePayment = async () => {
    if (!state?.cart?.items) {
      return toast.error('Cart is empty');
    }

    if (!address.trim()) {
      return toast.error('Please enter a delivery address');
    }

    setLoading(true);
    try {
      const items = state.cart.items.map(item => ({
        productId: item.productId?._id || item.productId,
        quantity: item.quantity || 1,
        price: item.productId?.price || item.price || 0
      }));

      // This total is only for immediate display — the server independently recomputes
      // subtotal/deliveryCharge/codCharge/discount from admin settings and is authoritative.
      const codCharge = paymentMethod === 'cod' ? COD_CHARGE : 0;
      const discount = appliedCoupon?.discount || 0;
      const totalAmount = Math.max(state.subtotal + DELIVERY_CHARGE + codCharge - discount, 0);

      if (paymentMethod === 'cod') {
        // COD Order - Direct placement without payment
        const { data: orderDB } = await api.post('/orders', {
          items,
          deliveryAddress: address,
          totalAmount,
          paymentMethod: 'cod',
          couponCode: appliedCoupon?.code,
          paymentStatus: 'pending',
          orderStatus: 'placed'
        });

        toast.success('Order placed successfully! You will pay ₹' + totalAmount + ' on delivery.');
        navigate('/customer/orders');
      } else {
        // Razorpay Payment
        if (!window.Razorpay) {
          return toast.error('Payment gateway not loaded. Please refresh and try again.');
        }

        if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {
          return toast.error('Payment configuration error. Contact support.');
        }

        try {
          const { data: orderDB } = await api.post('/orders', {
            items,
            deliveryAddress: address,
            totalAmount,
            paymentMethod: 'razorpay',
            couponCode: appliedCoupon?.code,
          });

          const { data } = await api.post('/payment/create-order', {
            amount: orderDB.totalPrice
          });

          const razorpayOrderId = data.id;

          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: orderDB.totalPrice * 100,
            currency: "INR",
            name: "Delivery App",
            description: "Online Payment",
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
                console.error('Payment verification error:', error.response?.data || error.message);
                toast.error(error.response?.data?.message || 'Payment verification failed');
              }
            },
            prefill: {
              name: user.name,
              email: user.email,
            },
            theme: {
              color: "#FF9900",
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        } catch (error) {
          console.error('Payment error:', error);
          toast.error(error.response?.data?.message || 'Failed to process payment. Please try again.');
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error('Could not process order');
    } finally {
      setLoading(false);
    }
  };

  if (!state?.cart) return null;

  const codCharge = paymentMethod === 'cod' ? COD_CHARGE : 0;
  const discount = appliedCoupon?.discount || 0;
  const totalWithCOD = Math.max(state.subtotal + DELIVERY_CHARGE + codCharge - discount, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="max-w-4xl mx-auto px-2 md:px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white px-3 md:px-8 py-4 md:py-6">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold">Checkout</h2>
          </div>

          <div className="p-3 md:p-6 lg:p-8 space-y-4 md:space-y-6 lg:space-y-8">
            {/* Delivery Address */}
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-4">
                Delivery Address
              </h3>
              <textarea
                className="w-full border-2 border-gray-300 p-2 md:p-4 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 text-sm md:text-base"
                rows="4"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your full delivery address..."
              ></textarea>
            </div>

            {/* Payment Method Selection */}
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">
                Select Payment Method
              </h3>
              <div className="space-y-2 md:space-y-4">
                {/* Online Payment */}
                <label
                  className="flex items-start p-2 md:p-4 border-2 rounded-lg cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition"
                  style={{
                    borderColor: paymentMethod === 'razorpay' ? '#FF9900' : '#D1D5DB',
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 w-4 h-4 text-orange-600 cursor-pointer flex-shrink-0"
                  />
                  <div className="ml-2 md:ml-4 flex-1">
                    <div className="flex items-center gap-1 md:gap-2">
                      <FaCreditCard className="text-orange-600 text-base md:text-lg" />
                      <span className="font-semibold text-sm md:text-base text-gray-900">
                        💳 Pay Online (Razorpay)
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 mt-1">Cards, UPI, Net Banking</p>
                  </div>
                </label>

                {/* Cash on Delivery */}
                {settings.codAvailable && (
                  <label
                    className="flex items-start p-2 md:p-4 border-2 rounded-lg cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition"
                    style={{
                      borderColor: paymentMethod === 'cod' ? '#FF9900' : '#D1D5DB',
                    }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1 w-4 h-4 text-orange-600 cursor-pointer flex-shrink-0"
                    />
                    <div className="ml-2 md:ml-4 flex-1">
                      <div className="flex items-center gap-1 md:gap-2">
                        <FaTruck className="text-green-600 text-base md:text-lg" />
                        <span className="font-semibold text-sm md:text-base text-gray-900">
                          🚚 Cash on Delivery (COD)
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">
                        Pay when your order arrives (Extra ₹{COD_CHARGE} charges)
                      </p>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* COD Info Box */}
            {paymentMethod === 'cod' && (
              <div className="p-3 md:p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                <p className="text-green-800 font-semibold text-xs md:text-sm">
                  ✓ You will pay ₹{totalWithCOD.toFixed(2)} when your order arrives at your doorstep
                </p>
              </div>
            )}

            {/* Coupon Code */}
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-4">Have a coupon?</h3>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border-2 border-green-300 rounded-lg">
                  <span className="text-green-800 font-semibold text-sm">
                    "{appliedCoupon.code}" applied — you saved ₹{appliedCoupon.discount.toFixed(2)}
                  </span>
                  <button onClick={removeCoupon} className="text-red-600 hover:text-red-800 text-sm font-semibold">
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1 border-2 border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                  >
                    {couponLoading ? 'Checking...' : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 p-3 md:p-6 rounded-lg border-l-4 border-orange-400">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 border-b pb-2 md:pb-4 mb-3 md:mb-4">
                Order Summary
              </h3>

              <div className="space-y-2 md:space-y-3 mb-3 md:mb-4">
                {state.cart.items.map(item => (
                  <div key={item.productId._id} className="flex justify-between text-gray-700 text-xs md:text-sm">
                    <span>{item.quantity} x {item.productId.title}</span>
                    <span className="font-semibold">
                      ₹{(item.productId.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-300 py-2 md:py-3 space-y-1 md:space-y-2 text-xs md:text-sm">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span>₹{state.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Delivery Charge:</span>
                  <span>₹{DELIVERY_CHARGE}</span>
                </div>
                {paymentMethod === 'cod' && (
                  <div className="flex justify-between text-gray-700">
                    <span>COD Charges:</span>
                    <span>₹{COD_CHARGE}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-green-700 font-semibold">
                    <span>Coupon Discount:</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center font-bold border-t border-gray-300 pt-2 md:pt-4 mt-2 md:mt-4 text-base md:text-lg">
                <span>Total to Pay:</span>
                <span className="text-orange-600">₹{totalWithCOD.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 md:gap-4">
              <button
                onClick={() => navigate('/cart')}
                className="flex-1 bg-gray-300 text-gray-900 py-2 md:py-3 rounded-lg hover:bg-gray-400 transition font-semibold text-xs md:text-base"
              >
                Back to Cart
              </button>
              <button
                onClick={handlePayment}
                disabled={loading || !address.trim()}
                className="flex-1 bg-orange-500 text-white py-2 md:py-3 rounded-lg hover:bg-orange-600 transition font-bold text-xs md:text-base disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order' : 'Pay Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
