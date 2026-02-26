import { useState } from 'react';
import { Link } from 'react-router';
import { Clock, CheckCircle, XCircle, ChefHat, Bell, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';
import { useCanteen, Order, OrderStatus } from '../store/canteenContext';

const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ElementType; description: string }> = {
  pending: { label: 'Pending', color: 'text-yellow-700', bg: 'bg-yellow-100', icon: Clock, description: 'Your order has been received' },
  preparing: { label: 'Preparing', color: 'text-blue-700', bg: 'bg-blue-100', icon: ChefHat, description: 'Kitchen is preparing your order' },
  ready: { label: 'Ready for Pickup', color: 'text-green-700', bg: 'bg-green-100', icon: Bell, description: 'Your order is ready! Please collect at the counter' },
  completed: { label: 'Completed', color: 'text-gray-600', bg: 'bg-gray-100', icon: CheckCircle, description: 'Order completed successfully' },
  cancelled: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-100', icon: XCircle, description: 'Order was cancelled' },
};

const steps: OrderStatus[] = ['pending', 'preparing', 'ready', 'completed'];

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[order.status];
  const Icon = config.icon;

  const stepIndex = steps.indexOf(order.status);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' +
      d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800 text-sm">{order.orderNumber}</span>
            <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${config.bg} ${config.color}`}>
              <Icon className="w-3 h-3" />
              {config.label}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.createdAt)}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-orange-600">₱{order.totalAmount.toFixed(2)}</p>
          <p className="text-xs text-gray-500 capitalize">{order.paymentMethod}</p>
        </div>
      </div>

      {/* Ready Alert */}
      {order.status === 'ready' && (
        <div className="mx-4 mb-3 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
          <Bell className="w-4 h-4 flex-shrink-0 animate-bounce" />
          <strong>Your order is ready! Please collect at the counter.</strong>
        </div>
      )}

      {/* Progress Steps (for active orders) */}
      {order.status !== 'cancelled' && (
        <div className="px-4 mb-4">
          <div className="flex items-center gap-1">
            {steps.map((step, idx) => {
              const isCompleted = stepIndex >= idx;
              const isCurrent = stepIndex === idx;
              const stepConf = statusConfig[step];
              const StepIcon = stepConf.icon;
              return (
                <div key={step} className="flex items-center flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    isCompleted
                      ? isCurrent && order.status !== 'completed' ? 'bg-orange-500' : 'bg-green-500'
                      : 'bg-gray-200'
                  }`}>
                    <StepIcon className={`w-3.5 h-3.5 ${isCompleted ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 ${idx < stepIndex ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2">{config.description}</p>
        </div>
      )}

      {/* Toggle Details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50">
          <div className="pt-3 space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.name} × {item.quantity}</span>
                <span className="font-medium text-gray-800">₱{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            {order.notes && (
              <div className="mt-2 pt-2 border-t border-dashed border-gray-200 text-xs text-gray-500">
                <strong>Notes:</strong> {order.notes}
              </div>
            )}
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-100">
              <span>Total</span>
              <span className="text-orange-600">₱{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const { currentUser, getUserOrders } = useCanteen();
  const [filter, setFilter] = useState<'active' | 'all'>('active');

  if (!currentUser) return null;

  const myOrders = getUserOrders(currentUser.id);
  const activeOrders = myOrders.filter(o => !['completed', 'cancelled'].includes(o.status));
  const displayOrders = filter === 'active' ? activeOrders : myOrders;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">My Orders</h1>
        <div className="flex bg-gray-100 rounded-xl p-1">
          {[
            { id: 'active', label: 'Active' },
            { id: 'all', label: 'All Orders' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === f.id ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
              {f.id === 'active' && activeOrders.length > 0 && (
                <span className="ml-1.5 bg-orange-500 text-white text-xs w-4 h-4 rounded-full inline-flex items-center justify-center">
                  {activeOrders.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {displayOrders.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8 text-orange-400" />
          </div>
          <h3 className="font-semibold text-gray-700 mb-2">
            {filter === 'active' ? 'No Active Orders' : 'No Orders Yet'}
          </h3>
          <p className="text-gray-500 text-sm mb-5">
            {filter === 'active' ? 'All orders have been completed.' : 'Start ordering from the menu.'}
          </p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
          >
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {displayOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
