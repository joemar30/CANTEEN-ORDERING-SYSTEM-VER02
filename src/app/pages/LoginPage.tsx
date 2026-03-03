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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(form.email, form.password);
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
    } catch (err: any) {
      setError(err.message || 'Cannot connect to server.');
    }
    setLoading(false);
  };

  const demoAccounts = [
    { label: 'Admin', email: 'admin@canteen.com', password: 'admin123', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
    { label: 'Staff', email: 'staff@canteen.com', password: 'staff123', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    { label: 'Customer', email: 'juan@student.com', password: 'pass123', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl shadow-primary/30 mb-6 rotate-3 hover:rotate-0 transition-transform duration-500">
            <UtensilsCrossed className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter">Canteen<span className="text-primary">POS</span></h1>
          <p className="text-muted-foreground mt-2 font-bold text-sm uppercase tracking-widest">Healthy · Fresh · Quick</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-10 border border-white/50 relative">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-black uppercase tracking-wider animate-in slide-in-from-top duration-300">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full px-6 py-4 bg-white/50 border border-border rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full px-6 py-4 bg-white/50 border border-border rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary pr-14 transition-all placeholder:text-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-all active:scale-90"
                >
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-orange-600 text-white py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-colors shadow-xl shadow-primary/30 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground font-bold">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline font-black ml-1">
                Create an Account
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Section */}
        <div className="mt-8 bg-white/40 backdrop-blur-sm rounded-3xl p-6 border border-white/30 text-center">
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] mb-4">Demo Accounts</p>
          <div className="flex gap-2 flex-wrap justify-center font-bold">
            {demoAccounts.map(acc => (
              <button
                key={acc.label}
                onClick={() => setForm({ email: acc.email, password: acc.password })}
                className={`text-[10px] px-4 py-2.5 rounded-xl uppercase tracking-widest transition-all active:scale-90 border-[1.5px] border-transparent hover:border-primary/20 bg-white/60 hover:bg-white text-slate-600 shadow-sm`}
              >
                {acc.label}
              </button>
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground/60 mt-4 font-bold uppercase tracking-widest italic tracking-wider">Note: Password for all demo is fixed in setup</p>
        </div>
      </div>
    </div>
  );
}
