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

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const order = await placeOrder(paymentMethod, notes);
      setPlacedOrder(order);
      setStep('success');
    } catch (err: any) {
      console.error('Failed to place order:', err);
    }
    setLoading(false);
  };

  if (step === 'success' && placedOrder) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 px-6">
        <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] shadow-2xl p-12 border border-white/50 animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-500 rounded-[2rem] mx-auto flex items-center justify-center mb-8 rotate-12 shadow-xl shadow-green-500/20">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-3 italic">Woot Woot! 🎉</h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest leading-relaxed">Your order has been deployed successfully.</p>

          <div className="mt-10 bg-primary/5 rounded-[2rem] p-8 text-left border border-primary/10 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-black uppercase tracking-widest">Serial Number</span>
                <span className="font-black text-primary bg-white px-4 py-1.5 rounded-full shadow-sm">{placedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-black uppercase tracking-widest">Payment Method</span>
                <span className="font-black text-slate-700 bg-white px-4 py-1.5 rounded-full shadow-sm uppercase">{placedOrder.paymentMethod}</span>
              </div>
              <div className="pt-4 border-t border-primary/20 flex justify-between items-center">
                <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Total Investment</span>
                <span className="font-black text-slate-800 text-2xl tracking-tighter">₱{placedOrder.totalAmount}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 p-5 bg-white rounded-3xl text-xs font-bold text-primary flex items-center gap-4 border border-primary/10 transition-all hover:bg-primary hover:text-white group">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white group-hover:text-primary transition-all">
              <span className="text-xl">👩‍🍳</span>
            </div>
            <p className="text-left leading-relaxed">Hang tight! Our chefs are preparing your delicious meal with extra love. ❤️</p>
          </div>

          <div className="mt-10 flex flex-col gap-3">
            <Link
              to="/orders"
              className="w-full bg-primary hover:bg-orange-600 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20 active:scale-95 group"
            >
              <span>Track Deployment</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/menu"
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 py-5 rounded-[1.5rem] font-black uppercase tracking-widest transition-all active:scale-95"
            >
              Back to Terminal
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
                className={`flex items-center gap-4 p-5 rounded-3xl border-2 cursor-pointer transition-all active:scale-[0.98] ${
                  paymentMethod === pm.id
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5 scale-[1.02]'
                    : 'border-slate-100 bg-white hover:border-slate-200'
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
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
                  paymentMethod === pm.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 text-slate-400'
                }`}>
                  <pm.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-black uppercase tracking-widest ${paymentMethod === pm.id ? 'text-primary' : 'text-slate-700'}`}>{pm.label}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">{pm.desc}</p>
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
      <div className="max-w-lg mx-auto text-center py-24 px-6">
        <div className="w-32 h-32 bg-primary/5 rounded-[3rem] mx-auto flex items-center justify-center mb-10 relative">
          <ShoppingCart className="w-12 h-12 text-primary/30" />
          <div className="absolute top-0 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border border-primary/10 animate-bounce">
             <span className="text-xl">🤔</span>
          </div>
        </div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-4 italic">Basket is Lonely...</h2>
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest leading-relaxed mb-10">Your appetite is the only missing ingredient.</p>
        <Link
          to="/menu"
          className="inline-flex items-center gap-4 bg-primary hover:bg-orange-600 text-white px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95 group hover:-translate-y-1"
        >
          <span className="group-hover:-rotate-12 transition-transform">🍔</span>
          Explore the Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <Link to="/menu" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-border text-slate-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm active:scale-90">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter italic">My Basket</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-1">Ready for checkout</p>
          </div>
        </div>
        <div className="bg-primary/5 px-6 py-2 rounded-2xl border border-primary/10">
          <span className="text-primary font-black text-sm uppercase tracking-widest leading-none">
            {cartItemsWithDetails.length} Item{cartItemsWithDetails.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItemsWithDetails.map(c => (
            <div key={c.menuItemId} className="bg-white rounded-[2rem] shadow-sm border border-border p-5 flex gap-5 group hover:shadow-xl transition-all duration-500">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-muted flex-shrink-0 group-hover:scale-105 transition-transform">
                <img
                  src={c.item.image}
                  alt={c.item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                <div>
                  <h3 className="font-black text-slate-800 text-base mb-1 truncate group-hover:text-primary transition-colors">{c.item.name}</h3>
                  <p className="text-primary font-black text-sm">₱{c.item.price}</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3 bg-muted/30 p-1.5 rounded-2xl border border-border/50">
                    <button
                      onClick={() => updateCartQty(c.menuItemId, c.quantity - 1)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-primary hover:shadow-sm transition-all active:scale-90"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-black w-6 text-center text-slate-700">{c.quantity}</span>
                    <button
                      onClick={() => updateCartQty(c.menuItemId, c.quantity + 1)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:bg-orange-600 transition-all active:scale-90"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      removeFromCart(c.menuItemId);
                      toast.error('Item removed from cart');
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-red-300 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
             <div className="relative z-10 space-y-4">
               <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Investment Summary</h3>
               <div className="flex justify-between text-sm opacity-80">
                 <span className="font-bold">Subtotal</span>
                 <span className="font-black">₱{total.toFixed(2)}</span>
               </div>
               <div className="flex justify-between text-sm opacity-80">
                 <span className="font-bold">Service Fee</span>
                 <span className="text-green-400 font-black">FREE</span>
               </div>
               <div className="pt-6 border-t border-slate-800 flex justify-between items-end">
                 <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Due</p>
                   <p className="text-4xl font-black text-white tracking-tighter">₱{grandTotal}</p>
                 </div>
               </div>
             </div>
          </div>

          <button
            onClick={() => setStep('checkout')}
            className="w-full bg-primary hover:bg-orange-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95 flex items-center justify-center gap-3 group hover:-translate-y-1"
          >
            <span>Proceed to Terminal</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
