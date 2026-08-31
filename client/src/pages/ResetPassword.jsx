import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaTruck, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import api from '../api/axios';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      toast.success(data.message);
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reset link is invalid or has expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Side - Brand/Gradient */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-orange-500 to-slate-900 items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-white/5 rounded-full mix-blend-overlay blur-3xl"></div>
        
        <div className="text-center z-10 px-8">
          <div className="flex items-center justify-center gap-4 text-white mb-8">
            <FaTruck className="text-6xl" />
            <h1 className="text-5xl font-extrabold tracking-tight">QuickCart</h1>
          </div>
          <p className="text-xl text-orange-50 font-medium">Create a strong new password to secure your account.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
        <div className="w-full max-w-md space-y-8 py-10">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Set New Password</h2>
            <p className="mt-2 text-sm text-slate-500">
              Please enter your new password below.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <Input
                  label="New Password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirm New Password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={confirmPassword && password !== confirmPassword ? "Passwords do not match" : null}
                />
              </div>
            </div>
            
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              size="lg"
            >
              Reset Password
            </Button>
          </form>

          <div className="text-center mt-8">
            <Link to="/login" className="inline-flex items-center gap-2 font-medium text-slate-500 hover:text-slate-800 text-sm transition-colors">
              <FaArrowLeft className="text-xs" /> Back to Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
