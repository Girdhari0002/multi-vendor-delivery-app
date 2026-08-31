import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaTruck, FaArrowLeft } from 'react-icons/fa';
import api from '../api/axios';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      toast.success(data.message);
      setSubmitted(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Side - Brand/Gradient */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-orange-500 to-slate-900 items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full mix-blend-overlay blur-2xl"></div>
        
        <div className="text-center z-10 px-8">
          <div className="flex items-center justify-center gap-4 text-white mb-8">
            <FaTruck className="text-6xl" />
            <h1 className="text-5xl font-extrabold tracking-tight">QuickCart</h1>
          </div>
          <p className="text-xl text-orange-50 font-medium">Reset your password quickly and securely.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
        <div className="w-full max-w-md space-y-8 py-10">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Forgot Password?</h2>
            <p className="mt-2 text-sm text-slate-500">
              {submitted ? "Check your email for the reset link." : "No worries, we'll send you reset instructions."}
            </p>
          </div>

          {submitted ? (
            <div className="bg-emerald-50 text-emerald-800 p-4 rounded-lg border border-emerald-100 text-center text-sm font-medium">
              If an account with that email exists, a reset link has been sent. Please check your inbox and spam folder.
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <Input
                label="Email Address"
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                size="lg"
              >
                Send Reset Link
              </Button>
            </form>
          )}

          <div className="text-center mt-8">
            <Link to="/login" className="inline-flex items-center gap-2 font-medium text-slate-600 hover:text-slate-900 transition-colors text-sm">
              <FaArrowLeft className="text-xs" /> Back to Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
