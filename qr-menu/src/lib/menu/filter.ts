import type { MenuItem } from '../api/menu';

export function filterMenuItems({
  items,
  categoryId,
  search,
  language
}: {
  items: MenuItem[];
  categoryId: string;
  search: string;
  language: 'ar' | 'en';
}) {
  const q = search.trim().toLowerCase();

  return items.filter((item) => {
    const byCategory = categoryId === '__all__' || item.category_id === categoryId;
    if (!byCategory) return false;
    if (!q) return true;

    const name = language === 'ar' ? item.name_ar : item.name_en;
    const desc = language === 'ar' ? item.desc_ar ?? '' : item.desc_en ?? '';
    return `${name} ${desc}`.toLowerCase().includes(q);
  });
}
