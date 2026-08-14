import { db } from '@/db';
import { orders, orderItems } from '@/db/schema';

export interface OrderItemPayload {
  productId: string;
  quantity: number;
  unitPrice: number | string;
}

export interface CreateOrderPayload {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  totalAmount: number | string;
  currency?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  orderStatus?: string;
  notes?: string;
  items: OrderItemPayload[];
}

export async function createOrder(payload: CreateOrderPayload) {
  const [newOrder] = await db.insert(orders).values({
    customerName: payload.customerName,
    customerEmail: payload.customerEmail,
    customerPhone: payload.customerPhone,
    deliveryAddress: payload.deliveryAddress,
    totalAmount: String(payload.totalAmount),
    currency: payload.currency || 'USD',
    paymentMethod: payload.paymentMethod || 'cod',
    paymentStatus: payload.paymentStatus || 'pending',
    orderStatus: payload.orderStatus || 'pending',
    notes: payload.notes || null,
  }).returning();

  if (payload.items && payload.items.length > 0) {
    const itemsToInsert = payload.items.map((item) => {
      const unitPriceNum = typeof item.unitPrice === 'number' ? item.unitPrice : parseFloat(item.unitPrice);
      const subtotalNum = unitPriceNum * item.quantity;
      return {
        orderId: newOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: unitPriceNum.toFixed(2),
        subtotal: subtotalNum.toFixed(2),
      };
    });

    await db.insert(orderItems).values(itemsToInsert);
  }

  return newOrder;
}
