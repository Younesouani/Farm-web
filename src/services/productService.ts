import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Retrieves all items in stock across categories.
 */
export async function getAllProducts() {
  return db.select().from(products);
}

/**
 * Creates a new product item in DB.
 */
export async function createProduct(data: typeof products.$inferInsert) {
  const [newProduct] = await db.insert(products).values(data).returning();
  return newProduct;
}

/**
 * Updates stock levels or pricing parameters.
 */
export async function updateProduct(id: string, data: Partial<typeof products.$inferInsert>) {
  const [updated] = await db.update(products).set(data).where(eq(products.id, id)).returning();
  return updated;
}
