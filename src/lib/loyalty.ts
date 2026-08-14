import crypto from 'crypto';
import { db } from '@/db';
import { coupons, orders } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Generates a deterministic customer ID hash from Email + Phone.
 */
export function generateCustomerCode(email: string, phone: string): string {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone.replace(/\D/g, '');
  return crypto.createHash('sha256').update(`${cleanEmail}:${cleanPhone}`).digest('hex').substring(0, 12).toUpperCase();
}

/**
 * Checks order history upon purchase completion and issues a 10% coupon on second order.
 */
export async function processLoyaltyRewards(customerEmail: string): Promise<string | null> {
  const userOrders = await db.select().from(orders).where(eq(orders.customerEmail, customerEmail));

  // Trigger on 2nd purchase
  if (userOrders.length === 2) {
    const couponCode = `WELCOME10-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    await db.insert(coupons).values({
      code: couponCode,
      discount: '10.00',
      discountType: 'percentage',
      isUsed: 0,
    });
    return couponCode;
  }
  return null;
}
