import { NextResponse } from 'next/server';
import { createOrder } from '@/services/orderService';
import { processLoyaltyRewards } from '@/lib/loyalty';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.customerEmail || !body.customerName || !body.customerPhone || !body.deliveryAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required customer details.' },
        { status: 400 }
      );
    }

    const order = await createOrder(body);

    // Process potential loyalty discount code on second purchase
    let couponCode = null;
    try {
      couponCode = await processLoyaltyRewards(body.customerEmail);
    } catch (e) {
      console.error('Loyalty rewards evaluation failed:', e);
    }

    return NextResponse.json(
      { success: true, order, couponCode },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Order route error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
