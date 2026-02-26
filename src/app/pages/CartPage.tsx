import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, CreditCard, Wallet, Banknote, CheckCircle, ChevronRight } from 'lucide-react';
import { useCanteen, PaymentMethod } from '../store/canteenContext';
import { toast } from 'sonner';

const paymentMethods = [
  { id: 'cash' as PaymentMethod, label: 'Cash', icon: Banknote, desc: 'Pay at counter when you pick up' },
  { id: 'ewallet' as PaymentMethod, label: 'E-Wallet', icon: Wallet, desc: 'GCash, Maya, PayMaya' },
  { id: 'card' as PaymentMethod, label: 'Credit/Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, JCB' },
];

export default function CartPage() {
  const { cart, menuItems, updateCartQty, removeFromCart, getCartTotal, placeOrder, currentUser } = useCanteen();
  const navigate = useNavigate();
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');
  const [placedOrder, setPlacedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const cartItemsWithDetails = cart.map(c => ({
    ...c,
    item: menuItems.find(m => m.id === c.menuItemId)!,
  })).filter(c => c.item);

  const total = getCartTotal();
  const serviceFee = 0;
  const grandTotal = total + serviceFee;

  const handlePlaceOrder = () => {
    setLoading(true);
    setTimeout(() => {
      const order = placeOrder(paymentMethod, notes);
      setPlacedOrder(order);
      setStep('success');
      setLoading(false);
    }, 800);
  };

  if (step === 'success' && placedOrder) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Order Placed!</h2>
          <p className="text-gray-500 text-sm">Your order has been received and is being processed.</p>

          <div className="mt-6 bg-orange-50 rounded-xl p-4 text-left">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Order Number</span>
              <span className="font-bold text-orange-600">{placedOrder.orderNumber}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Payment</span>
              <span className="font-medium capitalize">{placedOrder.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Amount</span>
              <span className="font-bold text-gray-800">₱{placedOrder.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-xl text-sm text-blue-700 flex items-start gap-2">
            <span className="text-base">ℹ️</span>
            <p>Please wait for your order to be prepared. You'll be notified when it's ready.</p>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <Link
              to="/orders"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              Track My Order
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to="/menu"
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-medium transition-colors"
            >
              Back to Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'checkout') {
    return (
      <div className="max-w-lg mx-auto">
        <button onClick={() => setStep('cart')} className="flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-5 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </button>

        <h1 className="text-xl font-bold text-gray-800 mb-5">Checkout</h1>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">Order Summary</h3>
          <div className="space-y-2">
            {cartItemsWithDetails.map(c => (
              <div key={c.menuItemId} className="flex justify-between text-sm">
                <span className="text-gray-600">{c.item.name} × {c.quantity}</span>
                <span className="font-medium">₱{(c.item.price * c.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="pt-2 mt-2 border-t border-dashed border-gray-200 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-orange-600">₱{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">Payment Method</h3>
          <div className="space-y-2">
            {paymentMethods.map(pm => (
              <label
                key={pm.id}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === pm.id
                    ? 'border-orange-400 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={pm.id}
                  checked={paymentMethod === pm.id}
                  onChange={() => setPaymentMethod(pm.id)}
                  className="sr-only"
                />
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  paymentMethod === pm.id ? 'bg-orange-500' : 'bg-gray-100'
                }`}>
                  <pm.icon className={`w-5 h-5 ${paymentMethod === pm.id ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{pm.label}</p>
                  <p className="text-xs text-gray-500">{pm.desc}</p>
                </div>
                {paymentMethod === pm.id && (
                  <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-orange-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Special Notes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">Special Instructions (Optional)</h3>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any special requests, allergies, or notes..."
            rows={3}
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          />
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-60 shadow-sm"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            `Confirm Order • ₱${grandTotal.toFixed(2)}`
          )}
        </button>
      </div>
    );
  }

  // Cart View
  if (cartItemsWithDetails.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-20 h-20 bg-orange-100 rounded-full mx-auto flex items-center justify-center mb-4">
          <ShoppingCart className="w-10 h-10 text-orange-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-700 mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 text-sm mb-6">Add items from the menu to get started</p>
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/menu" className="text-gray-600 hover:text-orange-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-gray-800">My Cart</h1>
        <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-0.5 rounded-full">
          {cartItemsWithDetails.length} item{cartItemsWithDetails.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Cart Items */}
      <div className="space-y-3 mb-5">
        {cartItemsWithDetails.map(c => (
          <div key={c.menuItemId} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-4">
            <img
              src={c.item.image}
              alt={c.item.name}
              className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 text-sm truncate">{c.item.name}</h3>
              <p className="text-orange-600 font-bold text-sm mt-0.5">₱{c.item.price.toFixed(2)}</p>
              <div className="flex items-center gap-3 mt-2">
                {/* Quantity Controls */}
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={() => updateCartQty(c.menuItemId, c.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white transition-colors text-gray-600"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-semibold w-5 text-center">{c.quantity}</span>
                  <button
                    onClick={() => updateCartQty(c.menuItemId, c.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white transition-colors text-orange-600"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <button
                  onClick={() => {
                    removeFromCart(c.menuItemId);
                    toast.error('Item removed from cart');
                  }}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="font-bold text-gray-800 text-sm">₱{(c.item.price * c.quantity).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Order Total */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>₱{total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Service Fee</span>
            <span className="text-green-600">Free</span>
          </div>
          <div className="flex justify-between font-bold text-gray-800 pt-2 border-t border-gray-100">
            <span>Total</span>
            <span className="text-orange-600">₱{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => setStep('checkout')}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
      >
        Proceed to Checkout
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
