// Upsert a list (insert or update if exists by id or name)
export async function upsertList(list: Omit<List, 'id'> & { id?: string }) {
  // Use 'id' as the unique identifier if present, otherwise upsert by name (if your schema allows)
  // Adjust onConflict as needed for your schema (e.g., 'id' or 'name')
  const { data, error } = await supabase
    .from('lists')
    .upsert([list], { onConflict: 'id' })
    .select()
    .single();
  if (error) return { error };
  return data;
}
import { supabase } from './supabaseClient';
export { supabase };

// Types for convenience
export interface Product {
  id: string;
  database_id: string;
  name: string;
  quantity: number;
  is_completed: boolean;
  is_out_of_stock: boolean;
  image_url?: string;
  image_fit?: string;
  comment?: string;
  category?: string;
}

export interface List {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  last_viewed_at?: string;
  source?: string;
}

export interface ListProduct {
  id: string;
  list_id: string;
  product_id: string;
  quantity: number;
  is_completed: boolean;
  is_out_of_stock: boolean;
}

// Fetch all lists with their products
export async function getListsWithProducts() {
  const { data, error } = await supabase
    .from('lists')
    .select(`*, list_products(*, products(*))`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// Add a new list
export async function addList(list: Partial<List>) {
  const { data, error } = await supabase
    .from('lists')
    .insert([list])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Add a product to a list
export async function addProductToList(list_id: string, product_id: string, quantity = 1) {
  const { data, error } = await supabase
    .from('list_products')
    .insert([{ list_id, product_id, quantity }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Update product quantity/completion in a list
export async function updateListProduct(list_product_id: string, updates: Partial<ListProduct>) {
  const { data, error } = await supabase
    .from('list_products')
    .update(updates)
    .eq('id', list_product_id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Remove a product from a list
export async function removeProductFromList(list_product_id: string) {
  const { error } = await supabase
    .from('list_products')
    .delete()
    .eq('id', list_product_id);
  if (error) throw error;
  return true;
}

// Delete a list (and its list_products)
export async function deleteList(list_id: string) {
  // Optionally, delete all list_products first (if not using ON DELETE CASCADE)
  await supabase.from('list_products').delete().eq('list_id', list_id);
  const { error } = await supabase.from('lists').delete().eq('id', list_id);
  if (error) throw error;
  return true;
}

// Add or get a product by database_id (upsert)
export async function upsertProduct(product: Omit<Product, 'id'>) {
  const { data, error } = await supabase
    .from('products')
    .upsert([product], { onConflict: 'database_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Add a product to a list (upsert product, then add to list)
export async function addProductAndLinkToList(list_id: string, product: Omit<Product, 'id'>, quantity = 1) {
  // Upsert product
  const prod = await upsertProduct(product);
  // Link to list
  return await addProductToList(list_id, prod.id, quantity);
}

// Delete a list and orphaned products (products not in any other list)
export async function deleteListAndOrphanedProducts(list_id: string) {
  // Get all product_ids in this list
  const { data: listProducts } = await supabase
    .from('list_products')
    .select('product_id')
    .eq('list_id', list_id);
  // Delete all list_products for this list
  await supabase.from('list_products').delete().eq('list_id', list_id);
  // Delete the list
  await supabase.from('lists').delete().eq('id', list_id);
  // For each product, check if it is used in any other list
  for (const lp of listProducts || []) {
    const { count } = await supabase
      .from('list_products')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', lp.product_id);
    if ((count || 0) === 0) {
      await supabase.from('products').delete().eq('id', lp.product_id);
    }
  }
  return true;
}

// Get all products for a list (for sharing)
export async function getProductsForList(list_id: string) {
  const { data, error } = await supabase
    .from('list_products')
    .select('products(*)')
    .eq('list_id', list_id);
  if (error) throw error;
  // Flatten to array of products
  return (data || []).map((lp: any) => lp.products);
}
