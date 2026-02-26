import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, Area, AreaChart
} from 'recharts';
import { TrendingUp, ShoppingBag, Users, DollarSign, Download } from 'lucide-react';
import { useCanteen } from '../../store/canteenContext';

const COLORS = ['#f97316', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444'];

export default function SalesReports() {
  const { orders, menuItems, categories } = useCanteen();
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('week');

  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter(o => {
      if (o.status === 'cancelled') return false;
      const d = new Date(o.createdAt);
      if (period === 'today') return d.toDateString() === now.toDateString();
      if (period === 'week') { const w = new Date(now); w.setDate(now.getDate() - 7); return d >= w; }
      if (period === 'month') { const m = new Date(now); m.setMonth(now.getMonth() - 1); return d >= m; }
      return true;
    });
  }, [orders, period]);

  const totalRevenue = filteredOrders.reduce((s, o) => s + o.totalAmount, 0);
  const paidRevenue = filteredOrders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.totalAmount, 0);
  const avgOrderValue = filteredOrders.length ? totalRevenue / filteredOrders.length : 0;
  const completedOrders = filteredOrders.filter(o => o.status === 'completed').length;

  // Revenue by day (last 7 days)
  const revenueByDay = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });
    return days.map(d => {
      const dayOrders = orders.filter(o => {
        const od = new Date(o.createdAt);
        return od.toDateString() === d.toDateString() && o.status !== 'cancelled';
      });
      return {
        date: d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }),
        revenue: dayOrders.reduce((s, o) => s + o.totalAmount, 0),
        orders: dayOrders.length,
      };
    });
  }, [orders]);

  // Sales by category
  const byCategory = useMemo(() => {
    const cats: Record<string, { name: string; revenue: number; count: number }> = {};
    filteredOrders.forEach(o => {
      o.items.forEach(item => {
        const mi = menuItems.find(m => m.id === item.menuItemId);
        if (!mi) return;
        const cat = categories.find(c => c.id === mi.categoryId);
        const key = cat?.id ?? 'unknown';
        const name = cat ? `${cat.icon} ${cat.name}` : 'Other';
        if (!cats[key]) cats[key] = { name, revenue: 0, count: 0 };
        cats[key].revenue += item.price * item.quantity;
        cats[key].count += item.quantity;
      });
    });
    return Object.values(cats).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders, menuItems, categories]);

  // Top items
  const topItems = useMemo(() => {
    const items: Record<string, { name: string; quantity: number; revenue: number }> = {};
    filteredOrders.forEach(o => {
      o.items.forEach(item => {
        if (!items[item.menuItemId]) items[item.menuItemId] = { name: item.name, quantity: 0, revenue: 0 };
        items[item.menuItemId].quantity += item.quantity;
        items[item.menuItemId].revenue += item.price * item.quantity;
      });
    });
    return Object.values(items).sort((a, b) => b.quantity - a.quantity).slice(0, 8);
  }, [filteredOrders]);

  // Payment methods
  const paymentData = useMemo(() => {
    const methods: Record<string, number> = {};
    filteredOrders.forEach(o => {
      methods[o.paymentMethod] = (methods[o.paymentMethod] || 0) + 1;
    });
    return Object.entries(methods).map(([name, value]) => ({
      name: name === 'ewallet' ? 'E-Wallet' : name === 'card' ? 'Card' : 'Cash',
      value
    }));
  }, [filteredOrders]);

  const periodLabels = { today: "Today", week: "Last 7 Days", month: "Last 30 Days", all: "All Time" };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Sales Reports</h1>
          <p className="text-sm text-gray-500">Performance overview and analytics</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(['today', 'week', 'month', 'all'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                period === p ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Revenue', value: `₱${totalRevenue.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: TrendingUp, color: 'bg-green-500', sub: `₱${paidRevenue.toFixed(2)} collected` },
          { label: 'Total Orders', value: filteredOrders.length, icon: ShoppingBag, color: 'bg-orange-500', sub: `${completedOrders} completed` },
          { label: 'Avg Order Value', value: `₱${avgOrderValue.toFixed(2)}`, icon: DollarSign, color: 'bg-blue-500', sub: 'Per order' },
          { label: 'Unique Customers', value: new Set(filteredOrders.map(o => o.userId)).size, icon: Users, color: 'bg-purple-500', sub: 'Active buyers' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-start justify-between mb-2">
              <div className={`w-8 h-8 ${s.color} rounded-lg flex items-center justify-center`}>
                <s.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-lg font-bold text-gray-800">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Daily Revenue (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueByDay}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₱${v}`} />
              <Tooltip formatter={(v: number) => [`₱${v.toFixed(2)}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Per Day */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Orders Per Day</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip formatter={(v: number) => [v, 'Orders']} />
              <Bar dataKey="orders" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Revenue by Category</h2>
          {byCategory.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={byCategory} cx="50%" cy="50%" outerRadius={65} dataKey="revenue" nameKey="name">
                    {byCategory.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`₱${v.toFixed(2)}`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {byCategory.map((c, idx) => (
                  <div key={c.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-gray-600 text-xs">{c.name}</span>
                    </div>
                    <span className="font-medium text-xs">₱{c.revenue.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Payment Methods</h2>
          {paymentData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={paymentData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" nameKey="name">
                    {paymentData.map((_, idx) => (
                      <Cell key={idx} fill={['#f97316', '#3b82f6', '#8b5cf6'][idx % 3]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {paymentData.map((p, idx) => (
                  <div key={p.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ['#f97316', '#3b82f6', '#8b5cf6'][idx % 3] }} />
                      <span className="text-xs text-gray-600">{p.name}</span>
                    </div>
                    <span className="text-xs font-medium">{p.value} orders</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Top Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Top Selling Items</h2>
          {topItems.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No data</div>
          ) : (
            <div className="space-y-3">
              {topItems.map((item, idx) => (
                <div key={item.name}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span className="truncate max-w-32">{idx + 1}. {item.name}</span>
                    <span className="font-medium text-gray-800">{item.quantity} sold</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-400 rounded-full transition-all"
                      style={{ width: `${(item.quantity / topItems[0].quantity) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
