'use server';

import { db } from '@/db';
import { products } from '@/db/schema';
import { revalidatePath } from 'next/cache';

export async function createProduct(prevState: any, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    const priceRaw = formData.get('price') as string;
    const stockRaw = formData.get('stock') as string;
    const description = formData.get('description') as string;
    const imageUrl = formData.get('imageUrl') as string;
    const weight = (formData.get('weight') as string) || 'N/A';
    const benefits = (formData.get('benefits') as string) || '';

    if (!name || !priceRaw) {
      return { error: 'Product name and price are required.' };
    }

    const price = parseFloat(priceRaw);
    const stock = stockRaw ? parseInt(stockRaw, 10) : 0;

    // Insert into Drizzle ORM
    await db.insert(products).values({
      name,
      category: category || 'General',
      price: price as any,
      stock: stock as any,
      description: description || '',
      imageUrl: imageUrl || '',
      weight,
      benefits,
    });

    revalidatePath('/admin/products');
    return { success: true, error: null };
  } catch (err: any) {
    return { error: err.message || 'Failed to create product.' };
  }
}
