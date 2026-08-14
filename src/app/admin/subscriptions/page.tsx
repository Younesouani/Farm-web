import { db } from '@/db';
import { subscriptions } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export const revalidate = 0;

export default async function AdminSubscriptionsPage() {
  // 1. Fetch recurring subscriptions using Drizzle ORM
  const subscriptionList = await db
    .select()
    .from(subscriptions)
    .orderBy(desc(subscriptions.id));

  // 2. Server Action to update subscription status (Active, Paused, Cancelled)
  async function updateSubscriptionStatus(formData: FormData) {
    'use server';
    const id = formData.get('id');
    const newStatus = formData.get('status') as string;

    if (!id || !newStatus) return;

    const subId = typeof id === 'string' && !isNaN(Number(id)) ? Number(id) : String(id);

    await db
      .update(subscriptions)
      .set({ status: newStatus as any })
      .where(eq(subscriptions.id, subId as any));

    revalidatePath('/admin/subscriptions');
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'paused':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'cancelled':
      case 'canceled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage recurring produce deliveries, user plans, and renewal states.
          </p>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">Sub ID</th>
                <th className="px-6 py-3">Customer / User</th>
                <th className="px-6 py-3">Plan / Frequency</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {subscriptionList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No recurring subscriptions found in database.
                  </td>
                </tr>
              ) : (
                subscriptionList.map((sub: any) => (
                  <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-medium text-gray-900">
                      #{sub.id}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {sub.userId ? `User ID: ${sub.userId}` : 'Subscriber'}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 capitalize">
                      {sub.planName || sub.frequency || 'Weekly Box'}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      ${Number(sub.price || sub.amount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                          sub.status || 'active'
                        )}`}
                      >
                        {sub.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <form
                        action={updateSubscriptionStatus}
                        className="inline-flex items-center gap-2"
                      >
                        <input type="hidden" name="id" value={sub.id} />
                        <select
                          name="status"
                          defaultValue={sub.status || 'active'}
                          className="text-xs bg-gray-50 border border-gray-300 text-gray-900 rounded-md p-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          type="submit"
                          className="px-2.5 py-1 bg-gray-900 hover:bg-gray-800 text-white rounded-md text-xs font-medium transition-colors"
                        >
                          Save
                        </button>
                      </form>
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

