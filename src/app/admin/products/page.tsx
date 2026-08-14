import { db } from '@/db';
import { products } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { AddProductModal } from '@/components/AddProductModal';
import { EditProductModal } from '@/components/EditProductModal';

export const revalidate = 0;

export default async function AdminProductsPage() {
  const productList = await db
    .select()
    .from(products)
    .where(eq(products.isArchived, 0))
    .orderBy(desc(products.createdAt));

  async function updateProduct(formData: FormData) {
    'use server';
    const id = String(formData.get('id'));
    const name = String(formData.get('name'));
    const category = String(formData.get('category'));
    const subcategory = String(formData.get('subcategory') || '');
    const price = String(formData.get('price'));
    const stock = Number(formData.get('stock') || 0);
    const weight = String(formData.get('weight') || '');
    const description = String(formData.get('description') || '');
    const benefits = String(formData.get('benefits') || '');
    const imageUrl = String(formData.get('imageUrl') || '');

    await db
      .update(products)
      .set({
        name,
        category,
        subcategory,
        price,
        stock,
        weight,
        description,
        benefits,
        imageUrl,
      })
      .where(eq(products.id, id));

    revalidatePath('/admin/products');
  }

  async function deleteProduct(formData: FormData) {
    'use server';
    const id = formData.get('id');
    if (!id) return;

    const productId = String(id);

    // Soft delete product so historical orders and foreign keys remain safe
    await db
      .update(products)
      .set({ isArchived: 1, stock: 0 })
      .where(eq(products.id, productId));

    revalidatePath('/admin/products');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            View, add, edit, and manage items in your catalog.
          </p>
        </div>
        <AddProductModal />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Stock</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {productList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No active products found in database.
                  </td>
                </tr>
              ) : (
                productList.map((product: any) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {product.name || 'Unnamed Product'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {product.category || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      ${Number(product.price || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {product.stock ?? 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <EditProductModal product={product} updateAction={updateProduct} />
                        <form action={deleteProduct} className="inline-block">
                          <input type="hidden" name="id" value={product.id} />
                          <button
                            type="submit"
                            className="text-red-600 hover:text-red-800 font-medium hover:underline text-xs"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
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
