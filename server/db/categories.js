import { supabase } from './supabase.js';
import { unwrap } from './helpers.js';

const COLUMNS = 'id,slug,name,icon,color,sort_order,created_at';

export async function listCategories() {
  const { data } = unwrap(await supabase.from('categories').select(COLUMNS).order('sort_order').order('name'));
  return data;
}

export async function getCategory(id) {
  const { data } = unwrap(await supabase.from('categories').select(COLUMNS).eq('id', id).maybeSingle());
  return data;
}

export async function createCategory(input) {
  const { data } = unwrap(await supabase.from('categories').insert(input).select(COLUMNS).single());
  return data;
}

export async function updateCategory(id, patch) {
  const { data } = unwrap(await supabase.from('categories').update(patch).eq('id', id).select(COLUMNS).maybeSingle());
  return data;
}

/** Resolves to true if a row was deleted. Rejects with IN_USE while spots still use the category. */
export async function deleteCategory(id) {
  const { data } = unwrap(await supabase.from('categories').delete().eq('id', id).select('id'));
  return data.length > 0;
}
