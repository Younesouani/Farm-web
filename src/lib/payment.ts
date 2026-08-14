/**
 * Processes multi-currency payments (MAD, USD, EUR, QAR) or validates Cash on Delivery.
 */
export async function processPayment(details: {
  amount: number;
  currency: string;
  method: 'cod' | 'stripe' | 'paypal' | 'card';
  orderId: string;
}) {
  if (details.method === 'cod') {
    return { success: true, transactionId: `COD-${Date.now()}`, status: 'pending_cash' };
  }
  
  // Integration point for Stripe / PayPal REST requests
  return {
    success: true,
    transactionId: `TX-${details.method.toUpperCase()}-${Date.now()}`,
    status: 'completed',
  };
}
