import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(8, 'Phone number must be at least 8 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password required'),
});

export const orderCreateSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(8),
  deliveryAddress: z.string().min(5),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(['cod', 'stripe', 'paypal', 'card']),
  currency: z.enum(['MAD', 'USD', 'EUR', 'QAR']).default('USD'),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().min(1),
    unitPrice: z.number().positive(),
  })).min(1, 'Order must contain at least 1 item'),
  isSubscription: z.boolean().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', '2months', '3months', '4months', '6months']).optional(),
});
