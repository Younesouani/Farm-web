import { db } from '@/db';
import { subscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Calculates next delivery date based on selected frequency.
 */
export function calculateNextDelivery(frequency: string): Date {
  const now = new Date();
  switch (frequency) {
    case 'daily': now.setDate(now.getDate() + 1); break;
    case 'weekly': now.setDate(now.getDate() + 7); break;
    case 'monthly': now.setMonth(now.getMonth() + 1); break;
    case '2months': now.setMonth(now.getMonth() + 2); break;
    case '3months': now.setMonth(now.getMonth() + 3); break;
    case '4months': now.setMonth(now.getMonth() + 4); break;
    case '6months': now.setMonth(now.getMonth() + 6); break;
    default: now.setDate(now.getDate() + 7);
  }
  return now;
}

export interface CreateSubscriptionPayload {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  frequency: string;
}

/**
 * Creates a recurring subscription entry for a customer.
 */
export async function createSubscription(payload: CreateSubscriptionPayload) {
  const nextDate = calculateNextDelivery(payload.frequency);
  const [sub] = await db.insert(subscriptions).values({
    customerName: payload.customerName,
    customerEmail: payload.customerEmail,
    customerPhone: payload.customerPhone,
    deliveryAddress: payload.deliveryAddress,
    frequency: payload.frequency,
    status: 'active',
    nextDeliveryDate: nextDate,
  }).returning();
  return sub;
}

/**
 * Pauses or modifies subscription delivery status.
 */
export async function updateSubscriptionStatus(subId: string, status: 'active' | 'paused' | 'cancelled') {
  return db.update(subscriptions).set({ status }).where(eq(subscriptions.id, subId)).returning();
}
