import { db } from '@/db';
import { products, orders, subscriptions } from '@/db/schema';
import { sql, desc } from 'drizzle-orm';
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  // 1. Total Products Count
  const [productCountResult] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(products);

  // 2. Total Orders Count
  const [orderCountResult] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(orders);

  // 3. Active Subscriptions Count
  const [subCountResult] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(subscriptions);

  // 4. Total Revenue Calculation
  const [revenueResult] = await db
    .select({ total: sql<number>`coalesce(sum(cast(${orders.totalAmount} as numeric)), 0)` })
    .from(orders);

  // 5. Fetch 5 Recent Orders
  const recentOrders = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(5);

  const totalProducts = productCountResult?.count || 0;
  const totalOrders = orderCountResult?.count || 0;
  const totalSubs = subCountResult?.count || 0;
  const totalRevenue = Number(revenueResult?.total || 0);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'processing':
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Dashboard Title Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of catalog inventory, sales metrics, customer orders, and active subscriptions.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Total Revenue</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">💰</span>
          </div>
          <div className="text-2xl font-black text-gray-900">
            ${totalRevenue.toFixed(2)}
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Total Orders</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">🛍️</span>
          </div>
          <div className="text-2xl font-black text-gray-900">{totalOrders}</div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Subscriptions</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">🔄</span>
          </div>
          <div className="text-2xl font-black text-gray-900">{totalSubs}</div>
        </div>

        {/* Products in Catalog */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Active Products</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">📦</span>
          </div>
          <div className="text-2xl font-black text-gray-900">{totalProducts}</div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Recent Purchases</h2>
            <p className="text-xs text-gray-500">Latest customer orders needing fulfillment.</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            View All Orders &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-2">Order ID</th>
                <th className="py-3 px-2">Customer</th>
                <th className="py-3 px-2">Total</th>
                <th className="py-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-xs text-gray-400">
                    No orders placed yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-emerald-50/20 transition-colors">
                    <td className="py-3.5 px-2 font-mono text-xs text-gray-900">
                      #{order.id.slice(0, 8)}...
                    </td>
                    <td className="py-3.5 px-2 font-medium text-gray-800">
                      {order.customerName}
                    </td>
                    <td className="py-3.5 px-2 font-bold text-emerald-600">
                      ${Number(order.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                          order.orderStatus || 'pending'
                        )}`}
                      >
                        {(order.orderStatus || 'pending').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
