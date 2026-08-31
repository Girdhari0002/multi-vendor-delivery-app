import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaTruck, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

const RESEND_COOLDOWN = 60; // 60 seconds cooldown

const VerifyOtp = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { verifyOtp, resendOtp } = useAuth();

  const [email] = useState(state?.email || '');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  
  const inputRefs = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    timerRef.current = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [cooldown]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace auto-focus previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }
    
    setLoading(true);
    try {
      const user = await verifyOtp(email, otpString);
      toast.success('Email verified! Welcome aboard.');
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'seller') navigate('/seller');
      else if (user.role === 'delivery') navigate('/delivery');
      else navigate('/');
    } catch (error) {
      // Error toast handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const data = await resendOtp(email);
      toast.success(data.message);
      setCooldown(RESEND_COOLDOWN);
    } catch (error) {
      // Error toast handled in context
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Side - Brand/Gradient */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-orange-500 to-slate-900 items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-white/5 rounded-full mix-blend-overlay blur-3xl"></div>
        
        <div className="text-center z-10 px-8">
          <div className="flex items-center justify-center gap-4 text-white mb-8">
            <FaTruck className="text-6xl" />
            <h1 className="text-5xl font-extrabold tracking-tight">QuickCart</h1>
          </div>
          <p className="text-xl text-orange-50 font-medium">Verify your identity to keep your account secure.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
        <div className="w-full max-w-md space-y-8 py-10">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Verify your email</h2>
            <p className="mt-2 text-sm text-slate-500">
              We sent a 6-digit code to <br /><span className="font-semibold text-slate-800">{email}</span>
            </p>
          </div>

          <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
            <div className="flex justify-between gap-2 sm:gap-3">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors shadow-sm"
                />
              ))}
            </div>
            
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              disabled={otp.join('').length !== 6}
              size="lg"
            >
              Verify & Continue
            </Button>
          </form>

          <div className="text-center mt-8 space-y-4">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="font-medium text-orange-600 hover:text-orange-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {cooldown > 0 ? `Resend code in ${cooldown}s` : resending ? 'Sending...' : "Didn't get a code? Resend"}
            </button>
            
            <div className="block">
              <Link to="/login" className="inline-flex items-center gap-2 font-medium text-slate-500 hover:text-slate-800 text-sm transition-colors">
                <FaArrowLeft className="text-xs" /> Back to Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
