import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router';
import { ShoppingCart, User, LogOut, Menu, X, UtensilsCrossed, Clock, Home } from 'lucide-react';
import { useCanteen } from '../../store/canteenContext';

export default function CustomerLayout() {
  const { currentUser, logout, getCartCount } = useCanteen();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/menu', label: 'Menu', icon: Home },
    { to: '/orders', label: 'My Orders', icon: Clock },
  ];

  const cartCount = getCartCount();

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      {/* Top Nav */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/menu" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-foreground font-black text-xl tracking-tighter block leading-none">Canteen<span className="text-primary">POS</span></span>
              <span className="text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-bold leading-none">Healthy & Fresh</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2 bg-muted/50 p-1.5 rounded-2xl">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  location.pathname === link.to
                    ? 'bg-white text-primary shadow-sm scale-105'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
                }`}
              >
                <link.icon className={`w-4 h-4 ${location.pathname === link.to ? 'text-primary' : ''}`} />
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative w-12 h-12 flex items-center justify-center rounded-2xl bg-primary/5 text-primary active:scale-90 transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-6 h-6 rounded-full flex items-center justify-center font-black border-4 border-background shadow-lg">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* User Dropdown - click toggled */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setUserMenuOpen(o => !o)}
                className="flex items-center gap-2 p-1.5 rounded-2xl transition-all active:scale-95 border border-transparent"
              >
                <div className="w-9 h-9 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center font-black text-sm">
                  {currentUser?.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left pr-2">
                  <p className="text-xs font-black text-foreground truncate max-w-[80px]">{currentUser?.name.split(' ')[0]}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{currentUser?.role}</p>
                </div>
              </button>

              {userMenuOpen && (
                <>
                  {/* Backdrop to close on outside click */}
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-border z-50 overflow-hidden">
                    <div className="p-4 bg-muted/30">
                      <p className="text-sm font-black text-foreground truncate">{currentUser?.name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground truncate uppercase">{currentUser?.email}</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                        className="w-full flex items-center gap-3 px-3 py-3 text-sm font-bold text-red-500 bg-red-50 rounded-xl active:scale-95"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden w-12 h-12 flex items-center justify-center rounded-2xl bg-muted text-foreground active:scale-90 transition-all shadow-sm"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-white px-6 pb-6 pt-4 space-y-4 animate-in slide-in-from-top duration-300">
            <nav className="space-y-2">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-bold transition-all transition-all active:scale-[0.98] ${
                    location.pathname === link.to
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="pt-4 border-t border-border mt-4">
              <div className="flex items-center gap-4 px-4 mb-4">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <span className="text-white text-lg font-black">{currentUser?.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-base font-black text-foreground">{currentUser?.name}</p>
                  <p className="text-xs font-bold text-muted-foreground">{currentUser?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 px-4 py-4 text-base font-black text-red-500 bg-red-50 rounded-2xl active:scale-95"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
