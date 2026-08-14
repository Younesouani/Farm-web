import { db } from '@/db';
import { orders, orderItems, products } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export const revalidate = 0;

export default async function AdminOrdersPage() {
  // 1. Fetch all orders (newest first)
  const orderList = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt));

  // 2. Fetch all order items linked with product names
  const allOrderItems = await db
    .select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      subtotal: orderItems.subtotal,
      productName: products.name,
    })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id));

  // Group items by orderId
  const itemsByOrder = allOrderItems.reduce((acc, item) => {
    if (!acc[item.orderId]) acc[item.orderId] = [];
    acc[item.orderId].push(item);
    return acc;
  }, {} as Record<string, typeof allOrderItems>);

  // 3. Server Action: Safely update order status
  async function updateStatus(formData: FormData) {
    'use server';
    const id = formData.get('id');
    const newStatus = formData.get('status') as string;

    if (!id || !newStatus) return;

    const orderId = String(id);

    // Fixed: map to `orderStatus` in schema instead of invalid `status`
    await db
      .update(orders)
      .set({ orderStatus: newStatus })
      .where(eq(orders.id, orderId));

    revalidatePath('/admin/orders');
  }

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders & Fulfillment</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review customer details, delivery addresses, items ordered, and update fulfillment status.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {orderList.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500 border border-gray-200 shadow-sm">
            No orders found in database.
          </div>
        ) : (
          orderList.map((order) => {
            const items = itemsByOrder[order.id] || [];
            const status = order.orderStatus || 'pending';

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Header Row */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-mono font-medium text-gray-500 uppercase block">
                      Order ID
                    </span>
                    <span className="text-sm font-mono font-bold text-gray-900">
                      #{order.id}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-gray-500 block">Total Amount</span>
                    <span className="text-sm font-bold text-emerald-600">
                      ${Number(order.totalAmount || 0).toFixed(2)} ({order.paymentMethod?.toUpperCase() || 'COD'})
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                        status
                      )}`}
                    >
                      {status.toUpperCase()}
                    </span>

                    {/* Status Update Form */}
                    <form action={updateStatus} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={order.id} />
                      <select
                        name="status"
                        defaultValue={status}
                        className="text-xs bg-white border border-gray-300 text-gray-900 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        Save
                      </button>
                    </form>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer & Delivery Information */}
                  <div className="space-y-2 border-r md:border-gray-100 pr-0 md:pr-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Customer & Delivery Details
                    </h3>
                    <div className="text-sm text-gray-800 space-y-1">
                      <p className="font-semibold text-gray-900">{order.customerName}</p>
                      <p className="text-gray-600">📧 {order.customerEmail}</p>
                      <p className="text-gray-600">📞 {order.customerPhone}</p>
                      <p className="text-gray-700 pt-1">
                        📍 <span className="font-medium">{order.deliveryAddress}</span>
                      </p>
                      {order.notes && (
                        <p className="text-xs italic text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 mt-2">
                          Note: {order.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Purchased Items List */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Items Ordered ({items.length})
                    </h3>
                    <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto pr-1">
                      {items.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No line items recorded.</p>
                      ) : (
                        items.map((item) => (
                          <div key={item.id} className="py-2 flex justify-between items-center text-sm">
                            <div>
                              <p className="font-medium text-gray-800">
                                {item.productName || 'Unknown Item'}
                              </p>
                              <p className="text-xs text-gray-500">
                                Qty: {item.quantity} × ${Number(item.unitPrice || 0).toFixed(2)}
                              </p>
                            </div>
                            <span className="font-semibold text-gray-900">
                              ${Number(item.subtotal || 0).toFixed(2)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
