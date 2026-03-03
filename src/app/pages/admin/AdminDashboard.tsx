import { Link } from 'react-router';
import { ShoppingBag, Users, UtensilsCrossed, TrendingUp, Clock, ChefHat, Bell, CheckCircle, ArrowRight, Tag } from 'lucide-react';
import { useCanteen, OrderStatus } from '../../store/canteenContext';

const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string; dot: string }> = {
  pending: { label: 'Pending', color: 'text-yellow-700', bg: 'bg-yellow-100', dot: 'bg-yellow-500' },
  preparing: { label: 'Preparing', color: 'text-blue-700', bg: 'bg-blue-100', dot: 'bg-blue-500' },
  ready: { label: 'Ready', color: 'text-green-700', bg: 'bg-green-100', dot: 'bg-green-500' },
  completed: { label: 'Completed', color: 'text-gray-600', bg: 'bg-gray-100', dot: 'bg-gray-400' },
  cancelled: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-100', dot: 'bg-red-500' },
};

export default function AdminDashboard() {
  const { orders, menuItems, users, categories, updateOrderStatus } = useCanteen();

  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
  const todayRevenue = todayOrders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.totalAmount, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const activeOrders = orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status));
  const customers = users.filter(u => u.role === 'customer');

  const stats = [
    { label: "Today's Revenue", value: `₱${todayRevenue.toFixed(0)}`, icon: TrendingUp, color: 'bg-green-500', change: `${todayOrders.length} orders today` },
    { label: 'Active Orders', value: activeOrders.length, icon: ShoppingBag, color: 'bg-orange-500', change: `${pendingOrders.length} pending` },
    { label: 'Menu Items', value: menuItems.length, icon: UtensilsCrossed, color: 'bg-blue-500', change: `${categories.length} categories` },
    { label: 'Customers', value: customers.length, icon: Users, color: 'bg-purple-500', change: 'Registered users' },
  ];

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
  };

  const topItems = (() => {
    const itemCounts: Record<string, { name: string; count: number; revenue: number }> = {};
    orders.forEach(o => {
      o.items.forEach(item => {
        if (!itemCounts[item.menuItemId]) itemCounts[item.menuItemId] = { name: item.name, count: 0, revenue: 0 };
        itemCounts[item.menuItemId].count += item.quantity;
        itemCounts[item.menuItemId].revenue += item.price * item.quantity;
      });
    });
    return Object.values(itemCounts).sort((a, b) => b.count - a.count).slice(0, 5);
  })();

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-6 animate-in slide-in-from-left-4 duration-500">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">{new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div key={stat.label} style={{ animationDelay: `${i * 100}ms` }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-in slide-in-from-bottom-4 duration-500 hover:-translate-y-1 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
              </div>
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 animate-in slide-in-from-bottom-6 duration-700 delay-300">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-800">Live Orders</h2>
              {activeOrders.length > 0 && (
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
            <Link to="/admin/orders" className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {activeOrders.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">No active orders</div>
            ) : (
              activeOrders.slice(0, 6).map(order => {
                const conf = statusConfig[order.status];
                return (
                  <div key={order.id} className="px-5 py-3 flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${conf.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-800">{order.orderNumber}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${conf.bg} ${conf.color}`}>
                          {conf.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{order.userName} • {order.items.length} items • {formatTime(order.createdAt)}</p>
                    </div>
                    <div className="flex-shrink-0 flex gap-1">
                      {order.status === 'pending' && (
                        <button
                          onClick={async () => {
                            try {
                              await updateOrderStatus(order.id, 'preparing');
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded-lg transition-colors"
                        >
                          Accept
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={async () => {
                            try {
                              await updateOrderStatus(order.id, 'ready');
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded-lg transition-colors"
                        >
                          Ready
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button
                          onClick={async () => {
                            try {
                              await updateOrderStatus(order.id, 'completed');
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 px-2 py-1 rounded-lg transition-colors"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 animate-in slide-in-from-bottom-6 duration-700 delay-500">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Top Selling Items</h2>
            <Link to="/admin/reports" className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1">
              Full Report <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {topItems.map((item, idx) => (
              <div key={item.name} className="px-5 py-3 flex items-center gap-3">
                <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                  idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                  idx === 1 ? 'bg-gray-100 text-gray-600' :
                  idx === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-50 text-gray-500'
                }`}>
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.count} orders</p>
                </div>
                <span className="text-sm font-semibold text-green-600 flex-shrink-0">₱{item.revenue.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        {[
          { to: '/admin/menu', label: 'Manage Menu', icon: UtensilsCrossed, color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
          { to: '/admin/categories', label: 'Categories', icon: Tag, color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
          { to: '/admin/orders', label: 'All Orders', icon: ShoppingBag, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
          { to: '/admin/users', label: 'Manage Users', icon: Users, color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
        ].map((link, i) => (
          <Link
            key={link.to}
            to={link.to}
            style={{ animationDelay: `${i * 150}ms` }}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl font-medium text-sm transition-all hover:-translate-y-1 hover:shadow-md ${link.color}`}
          >
            <link.icon className="w-6 h-6" />
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
