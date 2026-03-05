import { supabase } from '../supabase';

export type Settings = {
  id: number;
  restaurant_name_ar: string;
  restaurant_name_en: string;
  currency: string;
  tax_percent?: number;
  vat_note_ar?: string;
  vat_note_en?: string;
  mains_note_ar?: string;
  mains_note_en?: string;
};

export type Category = {
  id?: string;
  name_ar: string;
  name_en: string;
  slug: string;
  sort_order?: number;
  is_active?: boolean;
};

export type MenuItem = {
  id?: string;
  category_id?: string | null;
  name_ar: string;
  name_en: string;
  desc_ar?: string;
  desc_en?: string;
  price: number;
  price_text?: string | null;
  image_url?: string;
  tags?: string[];
  sort_order?: number;
  is_available?: boolean;
};

export async function getSettings() {
  const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single<Settings>();
  if (error) throw error;
  return data;
}

export async function updateSettings(settings: Partial<Settings> & { id?: number }) {
  const payload = {
    id: 1,
    ...settings
  };

  const { data, error } = await supabase.from('settings').upsert(payload).select('*').single<Settings>();
  if (error) throw error;
  return data;
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .returns<Category[]>();

  if (error) throw error;
  return data;
}

export async function getItems() {
  const { data, error } = await supabase.from('items').select('*').returns<MenuItem[]>();

  if (error) throw error;
  return data;
}

export async function upsertCategory(category: Category) {
  const { data, error } = await supabase.from('categories').upsert(category).select('*').single<Category>();
  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

export async function upsertItem(item: MenuItem) {
  const payload = {
    ...item,
    tags: item.tags ?? []
  };

  const { data, error } = await supabase.from('items').upsert(payload).select('*').single<MenuItem>();
  if (error) throw error;
  return data;
}

export async function deleteItem(id: string) {
  const { error } = await supabase.from('items').delete().eq('id', id);
  if (error) throw error;
}

export async function uploadMenuImage(file: File, path: string) {
  const { error } = await supabase.storage.from('menu-images').upload(path, file, {
    upsert: true,
    cacheControl: '3600'
  });

  if (error) throw error;

  const { data } = supabase.storage.from('menu-images').getPublicUrl(path);
  return data.publicUrl;
}

export async function isAdmin(userId: string) {
  const { data, error } = await supabase.from('admins').select('user_id').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return Boolean(data);
}
