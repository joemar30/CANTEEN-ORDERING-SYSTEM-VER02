import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { useCanteen, Order, OrderStatus } from '../../store/canteenContext';
import { toast } from 'sonner';

const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string; border: string }> = {
  pending: { label: 'Pending', color: 'text-yellow-700', bg: 'bg-yellow-100', border: 'border-yellow-200' },
  preparing: { label: 'Preparing', color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-200' },
  ready: { label: 'Ready', color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-200' },
  completed: { label: 'Completed', color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200' },
  cancelled: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-200' },
};

const nextStatus: Partial<Record<OrderStatus, { label: string; next: OrderStatus; color: string }>> = {
  pending: { label: 'Accept & Prepare', next: 'preparing', color: 'bg-blue-500 hover:bg-blue-600 text-white' },
  preparing: { label: 'Mark as Ready', next: 'ready', color: 'bg-green-500 hover:bg-green-600 text-white' },
  ready: { label: 'Complete Order', next: 'completed', color: 'bg-gray-600 hover:bg-gray-700 text-white' },
};

function OrderRow({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const { updateOrderStatus } = useCanteen();
  const conf = statusConfig[order.status];
  const next = nextStatus[order.status];

  const formatDate = (iso: string) => new Date(iso).toLocaleString('en-PH', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const paymentMethodLabel: Record<string, string> = { cash: 'Cash', ewallet: 'E-Wallet', card: 'Card' };

  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100">
        <td className="px-4 py-3">
          <div>
            <p className="font-medium text-gray-800 text-sm">{order.orderNumber}</p>
            <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
          </div>
        </td>
        <td className="px-4 py-3 hidden sm:table-cell">
          <p className="text-sm text-gray-700">{order.userName}</p>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${conf.bg} ${conf.color} ${conf.border}`}>
              {conf.label}
            </span>
          </div>
        </td>
        <td className="px-4 py-3 hidden md:table-cell">
          <div>
            <p className="text-sm font-medium text-gray-800">₱{order.totalAmount.toFixed(2)}</p>
            <p className="text-xs text-gray-400">{paymentMethodLabel[order.paymentMethod]}</p>
          </div>
        </td>
        <td className="px-4 py-3 hidden lg:table-cell">
          <span className={`text-xs px-2 py-0.5 rounded-full ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2 flex-wrap">
            {next && (
              <button
                onClick={async () => {
                  try {
                    await updateOrderStatus(order.id, next.next);
                    toast.success(`Order ${order.orderNumber} → ${statusConfig[next.next].label}`);
                  } catch (err) {
                    toast.error('Failed to update order status');
                  }
                }}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${next.color}`}
              >
                {next.label}
              </button>
            )}
            {order.status === 'pending' && (
              <button
                onClick={async () => {
                  try {
                    await updateOrderStatus(order.id, 'cancelled');
                    toast.error(`Order ${order.orderNumber} cancelled`);
                  } catch (err) {
                    toast.error('Failed to cancel order');
                  }
                }}
                className="text-xs px-3 py-1.5 rounded-lg font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
              >
                Cancel
              </button>
            )}
            <button onClick={() => setExpanded(!expanded)} className="p-1 text-gray-400 hover:text-gray-600">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-orange-50/50">
          <td colSpan={6} className="px-4 py-3">
            <div className="text-sm">
              <p className="font-medium text-gray-700 mb-2">Order Details:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-0.5">
                    <span className="text-gray-600">{item.name} × {item.quantity}</span>
                    <span className="font-medium text-gray-800">₱{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              {order.notes && (
                <div className="mt-2 p-2 bg-yellow-50 rounded-lg text-xs text-gray-600 border border-yellow-100">
                  <strong>Notes:</strong> {order.notes}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function OrderManagement() {
  const { orders } = useCanteen();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = orders.filter(o => {
    const matchSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.userName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Orders</h1>
          <p className="text-sm text-gray-500">{orders.length} total orders</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        {(['all', 'pending', 'preparing', 'ready', 'completed', 'cancelled'] as const).map(s => {
          const count = s === 'all' ? orders.length : statusCounts[s] ?? 0;
          const conf = s !== 'all' ? statusConfig[s] : null;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                statusFilter === s
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-orange-50 border border-gray-200'
              }`}
            >
              <span className="capitalize">{s === 'all' ? 'All' : statusConfig[s].label}</span>
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  statusFilter === s ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by order number or customer..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Order</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Customer</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden md:table-cell">Amount</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden lg:table-cell">Payment</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400 text-sm">No orders found</td>
                </tr>
              ) : (
                filtered.map(order => <OrderRow key={order.id} order={order} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
