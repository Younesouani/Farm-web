import { NextResponse } from 'next/server';
import { createSubscription } from '@/lib/subscription';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.customerEmail || !body.frequency) {
      return NextResponse.json(
        { success: false, error: 'Missing customer details or delivery frequency.' },
        { status: 400 }
      );
    }

    const subscription = await createSubscription(body);
    return NextResponse.json({ success: true, subscription }, { status: 201 });
  } catch (error: any) {
    console.error('Subscription route error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
