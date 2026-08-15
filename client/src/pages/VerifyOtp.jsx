import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const RESEND_COOLDOWN = 30; // seconds

const VerifyOtp = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { verifyOtp, resendOtp } = useAuth();

  const [email] = useState(state?.email || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await verifyOtp(email, otp);
      toast.success('Email verified! Welcome aboard.');
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'seller') navigate('/seller/dashboard');
      else if (user.role === 'delivery') navigate('/delivery/dashboard');
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
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 shadow-md rounded-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Verify your email</h2>
          <p className="text-center text-sm text-gray-500 mt-2">
            We sent a 6-digit code to <span className="font-semibold">{email}</span>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input
            type="text"
            inputMode="numeric"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            className="appearance-none block w-full text-center text-2xl tracking-[0.5em] px-3 py-3 border border-gray-300 rounded-md placeholder-gray-300 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>
        <div className="text-center mt-4 space-y-2">
          <button
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="font-medium text-blue-600 hover:text-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : resending ? 'Sending...' : "Didn't get a code? Resend"}
          </button>
          <Link to="/login" className="block font-medium text-gray-500 hover:text-gray-700 text-sm">
            Back to Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
