import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaTruck, FaEye, FaEyeSlash } from 'react-icons/fa';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'customer' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { label: '', color: 'bg-slate-200' };
    if (pass.length < 6) return { label: 'Weak', color: 'bg-red-500' };
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    if (pass.length >= 8 && hasSpecial && hasNumber) return { label: 'Strong', color: 'bg-emerald-500' };
    return { label: 'Medium', color: 'bg-yellow-500' };
  };

  const strength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (loading) return;
    setLoading(true);
    try {
      const data = await register(formData.name, formData.email, formData.password, formData.role);
      toast.success('Registration successful! Check your email for a verification code.');
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (error) {
      // Error logic in context handles toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Side - Brand/Gradient */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-orange-500 to-slate-900 items-center justify-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-10 w-32 h-32 bg-white/10 rounded-full mix-blend-overlay blur-xl"></div>
        <div className="absolute bottom-1/4 right-10 w-48 h-48 bg-orange-400/20 rounded-full mix-blend-overlay blur-2xl"></div>
        
        <div className="text-center z-10 px-8">
          <div className="flex items-center justify-center gap-4 text-white mb-8">
            <FaTruck className="text-6xl" />
            <h1 className="text-5xl font-extrabold tracking-tight">QuickCart</h1>
          </div>
          <p className="text-2xl text-orange-50 font-medium">Join us and Deliver Anything, Anywhere</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
        <div className="w-full max-w-md space-y-6 py-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create an account</h2>
            <p className="mt-2 text-sm text-slate-500">Sign up to get started</p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              type="text"
              name="name"
              required
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
            />
            
            <Input
              label="Email Address"
              type="email"
              name="email"
              required
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
            />
            
            <div>
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className={`h-full transition-all duration-300 ${strength.color}`} style={{ width: strength.label === 'Weak' ? '33%' : strength.label === 'Medium' ? '66%' : '100%' }}></div>
                  </div>
                  <span className={`text-xs font-medium ${
                    strength.label === 'Weak' ? 'text-red-500' : strength.label === 'Medium' ? 'text-yellow-600' : 'text-emerald-500'
                  }`}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              required
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-800">I am a...</label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`cursor-pointer rounded-lg border p-4 flex flex-col items-center transition-all ${formData.role === 'customer' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input type="radio" name="role" value="customer" checked={formData.role === 'customer'} onChange={handleChange} className="hidden" />
                  <span className="font-semibold text-sm">Customer</span>
                </label>
                <label className={`cursor-pointer rounded-lg border p-4 flex flex-col items-center transition-all ${formData.role === 'seller' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input type="radio" name="role" value="seller" checked={formData.role === 'seller'} onChange={handleChange} className="hidden" />
                  <span className="font-semibold text-sm">Seller</span>
                </label>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                size="lg"
              >
                Create Account
              </Button>
            </div>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-500 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
