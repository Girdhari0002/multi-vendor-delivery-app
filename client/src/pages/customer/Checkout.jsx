import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { FaCreditCard, FaMoneyBillWave, FaMapMarkerAlt, FaCheckCircle, FaBuilding, FaHome } from 'react-icons/fa';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import clsx from 'clsx';

const Checkout = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clearCart } = useCart();
  
  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddressStr, setNewAddressStr] = useState('');
  
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  
  const [settings, setSettings] = useState({ deliveryCharge: 50, codCharge: 20, codAvailable: true });
  const [loading, setLoading] = useState(false);

  const COD_CHARGE = settings.codCharge;
  const DELIVERY_CHARGE = settings.deliveryCharge;
  const subtotal = state?.subtotal || 0;
  const cartItems = state?.cart?.items || [];

  useEffect(() => {
    if (!state?.cart) {
      navigate('/cart');
    }
  }, [state, navigate]);

  useEffect(() => {
    const fetchSettingsAndProfile = async () => {
      try {
        const [settingsRes, profileRes] = await Promise.all([
          api.get('/settings'),
          api.get('/users/profile')
        ]);
        
        if (settingsRes.data) {
          setSettings(settingsRes.data);
          if (!settingsRes.data.codAvailable) setPaymentMethod('razorpay');
        }
        
        if (profileRes.data && profileRes.data.addresses) {
          setAddresses(profileRes.data.addresses);
          const defaultAddress = profileRes.data.addresses.find(a => a.isDefault);
          if (defaultAddress) {
            setSelectedAddress(formatAddress(defaultAddress));
          } else if (profileRes.data.addresses.length > 0) {
            setSelectedAddress(formatAddress(profileRes.data.addresses[0]));
          }
        }
      } catch (error) {
        console.error('Failed to load checkout data', error);
      }
    };
    fetchSettingsAndProfile();
  }, []);

  const formatAddress = (addr) => {
    if (typeof addr === 'string') return addr;
    return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}`;
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await api.post('/coupons/validate', {
        code: couponCode.trim(),
        orderTotal: subtotal,
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
    if (!cartItems.length) return toast.error('Cart is empty');
    if (!selectedAddress) return toast.error('Please enter a delivery address');

    setLoading(true);
    try {
      const items = cartItems.map(item => ({
        productId: item.productId?._id || item.productId,
        quantity: item.quantity || 1,
        price: item.productId?.price || item.price || 0
      }));

      const codCharge = paymentMethod === 'cod' ? COD_CHARGE : 0;
      const discount = appliedCoupon?.discount || 0;
      const totalAmount = Math.max(subtotal + DELIVERY_CHARGE + codCharge - discount, 0);

      const orderData = {
        items,
        deliveryAddress: selectedAddress,
        totalAmount,
        paymentMethod,
        couponCode: appliedCoupon?.code,
      };

      if (paymentMethod === 'cod') {
        await api.post('/orders', { ...orderData, paymentStatus: 'pending', orderStatus: 'placed' });
        toast.success(`Order placed successfully! Pay ₹${totalAmount.toFixed(2)} on delivery.`);
        clearCart();
        navigate('/orders');
      } else {
        if (!window.Razorpay) return toast.error('Payment gateway not loaded. Please refresh.');
        if (!import.meta.env.VITE_RAZORPAY_KEY_ID) return toast.error('Payment configuration error.');

        const { data: orderDB } = await api.post('/orders', orderData);
        const { data } = await api.post('/payment/create-order', { amount: orderDB.totalPrice });

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: orderDB.totalPrice * 100,
          currency: "INR",
          name: "Delivery App",
          description: "Online Payment",
          order_id: data.id,
          handler: async function (response) {
            try {
              await api.post('/payment/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderDB._id
              });
              toast.success('Payment successful!');
              clearCart();
              navigate('/orders');
            } catch (error) {
              toast.error(error.response?.data?.message || 'Payment verification failed');
            }
          },
          prefill: { name: user?.name, email: user?.email },
          theme: { color: "#FF6B00" },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      toast.error('Could not process order');
    } finally {
      setLoading(false);
    }
  };

  const codChargeAmt = paymentMethod === 'cod' ? COD_CHARGE : 0;
  const discountAmt = appliedCoupon?.discount || 0;
  const totalPayable = Math.max(subtotal + DELIVERY_CHARGE + codChargeAmt - discountAmt, 0);

  if (!state?.cart) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Progress Indicator */}
      <div className="mb-10">
        <div className="flex items-center justify-between relative max-w-2xl mx-auto">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-orange-500 -z-10 transition-all duration-300" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
          
          {[
            { num: 1, label: 'Address' },
            { num: 2, label: 'Payment' },
            { num: 3, label: 'Review' }
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center">
              <div className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors",
                step >= s.num ? "bg-orange-500 border-orange-200 text-white" : "bg-slate-100 border-white text-slate-400"
              )}>
                {step > s.num ? <FaCheckCircle /> : s.num}
              </div>
              <span className={clsx("mt-2 text-sm font-medium", step >= s.num ? "text-slate-900" : "text-slate-400")}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Form Area */}
        <div className="flex-1">
          <Card className="min-h-[400px]">
            {/* Step 1: Address */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900">Delivery Address</h2>
                
                {addresses.length > 0 && !showNewAddressForm ? (
                  <div className="space-y-4">
                    {addresses.map(addr => {
                      const addrStr = formatAddress(addr);
                      const isSelected = selectedAddress === addrStr;
                      return (
                        <div 
                          key={addr._id}
                          onClick={() => setSelectedAddress(addrStr)}
                          className={clsx(
                            "p-4 border-2 rounded-xl cursor-pointer transition-all flex gap-4",
                            isSelected ? "border-orange-500 bg-orange-50/50" : "border-slate-200 hover:border-slate-300"
                          )}
                        >
                          <div className="pt-1 text-slate-400">
                            {addr.type === 'Work' ? <FaBuilding /> : <FaHome />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-slate-900">{addr.type || 'Home'}</span>
                              {addr.isDefault && <Badge variant="primary">Default</Badge>}
                            </div>
                            <p className="text-slate-600 text-sm">{addrStr}</p>
                          </div>
                          <div className="flex items-center">
                            <div className={clsx(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                              isSelected ? "border-orange-500" : "border-slate-300"
                            )}>
                              {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <Button variant="outline" fullWidth onClick={() => setShowNewAddressForm(true)}>
                      + Add New Address
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Full Address</label>
                      <textarea
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        rows="3"
                        value={newAddressStr}
                        onChange={(e) => {
                          setNewAddressStr(e.target.value);
                          setSelectedAddress(e.target.value);
                        }}
                        placeholder="Enter full street address, city, state, and zip code..."
                      ></textarea>
                    </div>
                    {addresses.length > 0 && (
                      <Button variant="ghost" onClick={() => setShowNewAddressForm(false)}>
                        Cancel
                      </Button>
                    )}
                  </div>
                )}
                
                <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
                  <Button onClick={() => setStep(2)} disabled={!selectedAddress}>
                    Continue to Payment
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900">Payment Method</h2>
                
                <div className="space-y-4">
                  <div 
                    onClick={() => setPaymentMethod('razorpay')}
                    className={clsx(
                      "p-5 border-2 rounded-xl cursor-pointer transition-all flex items-start gap-4",
                      paymentMethod === 'razorpay' ? "border-orange-500 bg-orange-50/50" : "border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <div className="text-orange-500 text-xl"><FaCreditCard /></div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">Pay Online (Razorpay)</div>
                      <p className="text-sm text-slate-500 mt-1">Pay securely via Credit/Debit Cards, UPI, or Net Banking.</p>
                    </div>
                    <div className={clsx("w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5", paymentMethod === 'razorpay' ? "border-orange-500" : "border-slate-300")}>
                      {paymentMethod === 'razorpay' && <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>}
                    </div>
                  </div>

                  {settings.codAvailable && (
                    <div 
                      onClick={() => setPaymentMethod('cod')}
                      className={clsx(
                        "p-5 border-2 rounded-xl cursor-pointer transition-all flex items-start gap-4",
                        paymentMethod === 'cod' ? "border-orange-500 bg-orange-50/50" : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <div className="text-emerald-500 text-xl"><FaMoneyBillWave /></div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900">Cash on Delivery</div>
                        <p className="text-sm text-slate-500 mt-1">Pay when your order arrives. Extra ₹{COD_CHARGE} handling fee applies.</p>
                      </div>
                      <div className={clsx("w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5", paymentMethod === 'cod' ? "border-orange-500" : "border-slate-300")}>
                        {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>}
                      </div>
                    </div>
                  )}
                </div>

                {/* Coupon Code Section */}
                <div className="pt-6 mt-6 border-t border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-800 mb-3">Discount Coupon</h3>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="flex flex-col">
                        <span className="text-emerald-800 font-medium">{appliedCoupon.code}</span>
                        <span className="text-emerald-600 text-sm">Saved ₹{appliedCoupon.discount.toFixed(2)}</span>
                      </div>
                      <button onClick={removeCoupon} className="text-emerald-700 hover:text-emerald-900 text-sm font-semibold px-2 py-1 bg-emerald-100 rounded">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="uppercase"
                      />
                      <Button onClick={applyCoupon} loading={couponLoading} disabled={!couponCode.trim()} variant="secondary">
                        Apply
                      </Button>
                    </div>
                  )}
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                  <Button onClick={() => setStep(3)}>Review Order</Button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900">Review Your Order</h2>
                
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-4">
                  <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="text-slate-400 mt-1" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Delivering To</p>
                      <p className="text-slate-800 text-sm font-medium">{selectedAddress}</p>
                    </div>
                  </div>
                  
                  <div className="w-full h-px bg-slate-200"></div>
                  
                  <div className="flex items-start gap-3">
                    {paymentMethod === 'cod' ? <FaMoneyBillWave className="text-slate-400 mt-1" /> : <FaCreditCard className="text-slate-400 mt-1" />}
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Payment Method</p>
                      <p className="text-slate-800 text-sm font-medium">
                        {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment (Razorpay)'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-800">Items in Order ({cartItems.length})</h3>
                  <div className="max-h-60 overflow-y-auto pr-2 space-y-3 scrollbar-thin">
                    {cartItems.map(item => (
                      <div key={item.productId._id} className="flex gap-3">
                        <div className="w-16 h-16 bg-slate-100 rounded-md overflow-hidden shrink-0">
                          <img src={item.productId.image} alt={item.productId.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-800 line-clamp-1">{item.productId.title}</p>
                          <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="font-semibold text-slate-900 text-sm">
                          ₹{(item.productId.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                  <Button onClick={handlePayment} loading={loading} iconRight={paymentMethod === 'cod' ? undefined : <FaCreditCard />}>
                    {paymentMethod === 'cod' ? 'Place Order' : 'Pay Now'}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-96">
          <Card padding="lg" className="sticky top-24 border-orange-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Price Breakdown</h2>
            
            <div className="space-y-3 text-sm text-slate-600 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-slate-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-medium text-slate-900">₹{DELIVERY_CHARGE.toFixed(2)}</span>
              </div>
              {paymentMethod === 'cod' && (
                <div className="flex justify-between">
                  <span>COD Charge</span>
                  <span className="font-medium text-slate-900">₹{COD_CHARGE.toFixed(2)}</span>
                </div>
              )}
              {discountAmt > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount</span>
                  <span className="font-semibold">-₹{discountAmt.toFixed(2)}</span>
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center text-lg font-bold text-slate-900">
                <span>Total Payable</span>
                <span className="text-orange-500">₹{totalPayable.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
