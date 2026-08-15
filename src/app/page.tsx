'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Leaf, RefreshCw, ShieldCheck, Plus, Minus, X, CheckCircle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  price: string;
  stock: number;
  weight: string;
  description: string;
  benefits: string;
  imageUrl: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function Storefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubscription, setIsSubscription] = useState(false);
  const [frequency, setFrequency] = useState('weekly');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [checkoutData, setCheckoutData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'cod',
    notes: ''
  });
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  const categories = ['All', 'Honey', 'Milk', 'Olive Oil', 'Eggs', 'Dairy'];

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.data);
        } else {
          setFetchError(data.error || 'Failed to load inventory.');
        }
      })
      .catch(() => setFetchError('Network error connecting to store database.'))
      .finally(() => setLoading(false));
  }, []);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0).toFixed(2);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      customerName: checkoutData.name,
      customerEmail: checkoutData.email,
      customerPhone: checkoutData.phone,
      deliveryAddress: checkoutData.address,
      totalAmount: calculateTotal(),
      paymentMethod: checkoutData.paymentMethod,
      currency: 'USD',
      notes: checkoutData.notes,
      items: cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: parseFloat(item.product.price),
      })),
      isSubscription,
      frequency: isSubscription ? frequency : undefined,
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (res.ok && data.success) {
          setOrderSuccess(data.order?.id || 'SUCCESS');
          setCart([]);
          setIsCartOpen(false);
        } else {
          alert(`Order Error: ${data.error || 'Failed to place order'}`);
        }
      } else {
        const rawText = await res.text();
        alert(`Server Error (${res.status}): ${rawText.slice(0, 120)}`);
      }
    } catch (err: any) {
      alert(`Network Error: ${err.message || 'Failed to submit request'}`);
    }
  };

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/icon.png" alt="Ecolife Logo" className="w-10 h-10 rounded-xl shadow-sm" />
          <span className="text-xl font-extrabold text-emerald-950">Ecolife Farm</span>
        </div>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative bg-emerald-50 hover:bg-emerald-100 text-emerald-800 p-3 rounded-full transition flex items-center gap-2"
        >
          <ShoppingBag className="w-5 h-5" />
          {cart.length > 0 && (
            <span className="bg-emerald-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {cart.reduce((a, b) => a + b.quantity, 0)}
            </span>
          )}
        </button>
      </header>

      <section className="bg-gradient-to-b from-emerald-900 to-emerald-800 text-white py-12 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="bg-emerald-700/60 text-emerald-200 text-xs font-semibold px-4 py-1.5 rounded-full border border-emerald-500/30 inline-block">
            100% Organic & Farm Fresh
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">
            Pure Honey, Raw Dairy & Cold-Pressed Oils Directly to Your Door
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base">
            Sustainably harvested from local eco-farms. Set up auto-deliveries and never run out of daily essentials.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500 font-medium">Loading organic catalog...</div>
        ) : fetchError ? (
          <div className="text-center py-16 bg-red-50 text-red-700 rounded-2xl border border-red-200 p-6 my-6">
            <p className="font-bold">{fetchError}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-slate-400">No products found in this category.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition duration-500"
                    />
                    <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">
                      {product.weight}
                    </span>
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                      {product.category} {product.subcategory && `• ${product.subcategory}`}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{product.name}</h3>
                    <p className="text-slate-600 text-sm line-clamp-2">{product.description}</p>
                    <div className="bg-emerald-50/60 p-2.5 rounded-lg text-xs text-emerald-900 flex items-start gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{product.benefits}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-4">
                  <div>
                    <span className="text-xs text-slate-400 block">Price</span>
                    <span className="text-xl font-extrabold text-slate-900">${product.price}</span>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-2 rounded-xl transition text-sm flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col justify-between p-6 shadow-2xl overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-600" /> Your Cart
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="p-1 rounded-lg hover:bg-slate-100">
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-16 text-slate-400">Your cart is empty.</div>
              ) : (
                <div className="space-y-4 my-6">
                  {cart.map(({ product, quantity }) => (
                    <div key={product.id} className="flex items-center justify-between border-b pb-3">
                      <div>
                        <h4 className="font-semibold text-sm text-slate-800">{product.name}</h4>
                        <span className="text-xs text-slate-500">${product.price} each</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border rounded-lg">
                          <button onClick={() => updateQuantity(product.id, -1)} className="p-1 hover:bg-slate-100">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-sm font-semibold">{quantity}</span>
                          <button onClick={() => updateQuantity(product.id, 1)} className="p-1 hover:bg-slate-100">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mt-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSubscription}
                        onChange={(e) => setIsSubscription(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="font-bold text-sm text-emerald-950 flex items-center gap-1">
                          <RefreshCw className="w-4 h-4 text-emerald-600" /> Auto-Deliver to me
                        </span>
                        <p className="text-xs text-emerald-800">Recurring fresh deliveries right on schedule.</p>
                      </div>
                    </label>

                    {isSubscription && (
                      <div className="mt-3">
                        <label className="block text-xs font-semibold text-emerald-900 mb-1">Frequency</label>
                        <select
                          value={frequency}
                          onChange={(e) => setFrequency(e.target.value)}
                          className="w-full bg-white border border-emerald-300 text-sm rounded-lg p-2 focus:ring-emerald-500"
                        >
                          <option value="daily">Every Day</option>
                          <option value="weekly">Every Week</option>
                          <option value="monthly">Every Month</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleCheckout} className="space-y-3 pt-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      required
                      value={checkoutData.name}
                      onChange={(e) => setCheckoutData({ ...checkoutData, name: e.target.value })}
                      className="w-full border rounded-lg p-2.5 text-sm"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      required
                      value={checkoutData.email}
                      onChange={(e) => setCheckoutData({ ...checkoutData, email: e.target.value })}
                      className="w-full border rounded-lg p-2.5 text-sm"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      required
                      value={checkoutData.phone}
                      onChange={(e) => setCheckoutData({ ...checkoutData, phone: e.target.value })}
                      className="w-full border rounded-lg p-2.5 text-sm"
                    />
                    <textarea
                      placeholder="Delivery Street Address"
                      required
                      value={checkoutData.address}
                      onChange={(e) => setCheckoutData({ ...checkoutData, address: e.target.value })}
                      className="w-full border rounded-lg p-2.5 text-sm h-20"
                    ></textarea>
                    <select
                      value={checkoutData.paymentMethod}
                      onChange={(e) => setCheckoutData({ ...checkoutData, paymentMethod: e.target.value })}
                      className="w-full border rounded-lg p-2.5 text-sm"
                    >
                      <option value="cod">Cash on Delivery (Pay to delivery guy)</option>
                    </select>

                    <div className="pt-4 border-t flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-emerald-700">${calculateTotal()}</span>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl transition mt-2"
                    >
                      Confirm Order
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {orderSuccess && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto" />
            <h3 className="text-2xl font-bold text-slate-900">Order Confirmed!</h3>
            <p className="text-sm text-slate-600">
              Your Order ID is <span className="font-mono font-bold text-xs">{orderSuccess}</span>.
            </p>
            <button
              onClick={() => setOrderSuccess(null)}
              className="w-full bg-emerald-700 text-white font-bold py-2.5 rounded-xl"
            >
              Back to Store
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
