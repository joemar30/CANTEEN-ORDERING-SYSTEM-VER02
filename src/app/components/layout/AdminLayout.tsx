import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router';
import {
  LayoutDashboard, UtensilsCrossed, ShoppingBag, BarChart3,
  Users, LogOut, Menu, X, ChevronRight, Tag
} from 'lucide-react';
import { useCanteen } from '../../store/canteenContext';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/menu', label: 'Menu Items', icon: UtensilsCrossed },
  { to: '/admin/categories', label: 'Categories', icon: Tag },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/reports', label: 'Sales Reports', icon: BarChart3 },
  { to: '/admin/users', label: 'Users', icon: Users },
];

export default function AdminLayout() {
  const { currentUser, logout, orders } = useCanteen();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-8 border-b border-slate-800/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform">
            <UtensilsCrossed className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-black text-lg tracking-tighter leading-none">Canteen<span className="text-primary">POS</span></p>
            <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mt-1">Admin Terminal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-6 space-y-2">
        {navItems.map(item => (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group active:scale-[0.98] ${
              isActive(item)
                ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive(item) ? 'text-white' : 'group-hover:text-primary'}`} />
            <span className="flex-1">{item.label}</span>
            {item.to === '/admin/orders' && pendingOrders > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                {pendingOrders}
              </span>
            )}
            {!isActive(item) && <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />}
          </Link>
        ))}
      </nav>

      {/* User Info */}
      <div className="p-6 border-t border-slate-800/50 bg-slate-950/30">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 bg-slate-800 text-primary border border-slate-700 rounded-2xl flex items-center justify-center flex-shrink-0 font-black">
            {currentUser?.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-black truncate">{currentUser?.name}</p>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">{currentUser?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl text-red-400 bg-red-400/5 text-xs font-black uppercase tracking-widest active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 fixed left-0 top-0 bottom-0 z-40 border-r border-slate-800 shadow-2xl">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-slate-900 z-10 animate-in slide-in-from-left duration-300 shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-20 flex items-center px-6 lg:px-10 sticky top-0 z-30 justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2.5 rounded-2xl bg-slate-100 text-slate-600 active:scale-90 transition-all shadow-sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-black tracking-tight text-slate-800 hidden sm:block">
              {navItems.find(n => isActive(n))?.label ?? 'Admin Terminal'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {pendingOrders > 0 && (
              <Link to="/admin/orders" className="flex items-center gap-2.5 bg-red-50 text-red-600 text-[10px] uppercase tracking-widest font-black px-4 py-2 rounded-2xl hover:bg-red-100 transition-all border border-red-200 animate-in slide-in-from-right duration-500">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                {pendingOrders} New Order{pendingOrders !== 1 ? 's' : ''}
              </Link>
            )}
            <Link
              to="/menu"
              className="group flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-slate-400 hover:text-primary transition-all bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl hover:bg-white hover:border-primary/20"
            >
              <span>View Portal</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
