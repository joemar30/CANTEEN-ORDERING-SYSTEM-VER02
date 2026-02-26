import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { UtensilsCrossed, Eye, EyeOff, LogIn } from 'lucide-react';
import { useCanteen } from '../store/canteenContext';

export default function LoginPage() {
  const { login } = useCanteen();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const result = login(form.email, form.password);
      if (result.success) {
        // Redirect based on role
        const savedUser = sessionStorage.getItem('canteen_user');
        const user = savedUser ? JSON.parse(savedUser) : null;
        if (user?.role === 'admin' || user?.role === 'staff') {
          navigate('/admin');
        } else {
          navigate('/menu');
        }
      } else {
        setError(result.message);
      }
      setLoading(false);
    }, 500);
  };

  const demoAccounts = [
    { label: 'Admin', email: 'admin@canteen.com', password: 'admin123', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
    { label: 'Staff', email: 'staff@canteen.com', password: 'staff123', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    { label: 'Customer', email: 'juan@student.com', password: 'pass123', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4">
            <UtensilsCrossed className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome to CanteenPOS</h1>
          <p className="text-gray-500 mt-1 text-sm">Sign in to start ordering</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-100">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-gray-50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-gray-50 pr-10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-60 shadow-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-orange-500 hover:text-orange-600 font-medium">
              Register here
            </Link>
          </div>
        </div>

        {/* Demo Accounts */}
        <div className="mt-6 bg-white/80 rounded-2xl p-4 border border-orange-100">
          <p className="text-xs text-gray-500 text-center mb-3 font-medium">DEMO ACCOUNTS</p>
          <div className="flex gap-2 flex-wrap justify-center">
            {demoAccounts.map(acc => (
              <button
                key={acc.label}
                onClick={() => setForm({ email: acc.email, password: acc.password })}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${acc.color}`}
              >
                {acc.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">Click to autofill credentials</p>
        </div>
      </div>
    </div>
  );
}
