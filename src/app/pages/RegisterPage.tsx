import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { UtensilsCrossed, Eye, EyeOff, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCanteen } from '../store/canteenContext';

export default function RegisterPage() {
  const { register } = useCanteen();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name.trim()) { setError('Please enter your full name.'); return; }
    if (!form.email.trim()) { setError('Please enter your email address.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match. Please re-enter.'); return; }

    setLoading(true);
    try {
      const result = await register(form.name.trim(), form.email.trim(), form.password, form.phone.trim());
      if (result.success) {
        setSuccess('Account created! Redirecting to menu...');
        setTimeout(() => navigate('/menu'), 1500);
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Cannot connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { label: 'Too short', color: 'bg-red-400', width: 'w-1/4' };
    if (p.length < 8) return { label: 'Weak', color: 'bg-orange-400', width: 'w-2/4' };
    if (p.length < 12) return { label: 'Good', color: 'bg-yellow-400', width: 'w-3/4' };
    return { label: 'Strong', color: 'bg-green-500', width: 'w-full' };
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/8 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-200/30 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-primary/25 mb-5">
            <UtensilsCrossed className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Create Account</h1>
          <p className="text-gray-500 mt-1.5 text-sm font-medium">Join CanteenPOS and start ordering today</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">

          {/* Error alert */}
          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm font-semibold">{error}</p>
            </div>
          )}

          {/* Success alert */}
          {success && (
            <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-green-700 text-sm font-semibold">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Full Name */}
            <div className="space-y-1">
              <label htmlFor="name" className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Juan Dela Cruz"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all placeholder:text-gray-300"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label htmlFor="email" className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all placeholder:text-gray-300"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label htmlFor="phone" className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                Phone Number <span className="text-gray-400 font-medium normal-case">(optional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="09XXXXXXXXX"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all placeholder:text-gray-300"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label htmlFor="password" className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white pr-12 transition-all placeholder:text-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-all"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength indicator */}
              {strength && (
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} ${strength.width} rounded-full transition-all duration-300`} />
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{strength.label}</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPw ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:bg-white pr-12 transition-all placeholder:text-gray-300 ${
                    form.confirmPassword && form.confirmPassword !== form.password
                      ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                      : form.confirmPassword && form.confirmPassword === form.password
                        ? 'border-green-300 focus:ring-green-200 focus:border-green-400'
                        : 'border-gray-200 focus:ring-primary/20 focus:border-primary'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-all"
                >
                  {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {form.confirmPassword && form.confirmPassword === form.password && (
                  <CheckCircle2 className="absolute right-12 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !!success}
              className="w-full mt-2 bg-primary hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 transition-colors shadow-lg shadow-primary/20"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Account Created!
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create My Account
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-orange-600 font-bold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
