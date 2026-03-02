import { useEffect, useMemo, useState } from 'react';
import BottomSheet from '../../components/BottomSheet';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import Input from '../../components/Input';
import Skeleton from '../../components/Skeleton';
import { deleteItem, getCategories, getItems, type Category, type MenuItem, upsertItem, uploadMenuImage } from '../../lib/api/menu';
import { useLanguage } from '../../lib/language';

type Props = {
  notify: (message: string) => void;
};

const TAGS = ['New', 'Popular', 'Spicy', 'Vegan'];

const EMPTY_FORM: MenuItem = {
  category_id: null,
  name_ar: '',
  name_en: '',
  desc_ar: '',
  desc_en: '',
  price: 0,
  image_url: '',
  tags: [],
  sort_order: 0,
  is_available: true
};

export default function Items({ notify }: Props) {
  const { language, t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [form, setForm] = useState<MenuItem>(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      const [cats, list] = await Promise.all([getCategories(), getItems()]);
      setCategories(cats);
      setItems(
        [...list].sort((a, b) => {
          const aCat = a.category_id || 'zzz';
          const bCat = b.category_id || 'zzz';
          if (aCat !== bCat) return aCat.localeCompare(bCat);
          return (a.sort_order ?? 0) - (b.sort_order ?? 0);
        })
      );
    } catch {
      setError(t('تعذر تحميل الأصناف.', 'Unable to load items.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase().trim();
    return items.filter((item) => {
      const catOk = categoryFilter === 'all' || item.category_id === categoryFilter;
      if (!catOk) return false;
      if (!q) return true;
      const text = [item.name_ar, item.name_en, item.desc_ar ?? '', item.desc_en ?? ''].join(' ').toLowerCase();
      return text.includes(q);
    });
  }, [categoryFilter, items, search]);

  async function onUpload(file: File | null) {
    if (!file) return;
    try {
      setSaving(true);
      const itemId = form.id ?? crypto.randomUUID();
      const categorySlug = categories.find((c) => c.id === form.category_id)?.slug ?? 'uncategorized';
      const path = `${categorySlug}/${itemId}-${Date.now()}.jpg`;
      const url = await uploadMenuImage(file, path);
      setForm((prev) => ({ ...prev, id: itemId, image_url: url }));
      notify(t('تم رفع الصورة.', 'Image uploaded.'));
    } catch {
      setError(t('فشل رفع الصورة.', 'Failed to upload image.'));
    } finally {
      setSaving(false);
    }
  }

  async function saveItem() {
    if (!form.name_ar.trim() || !form.name_en.trim()) {
      setError(t('اسم الصنف مطلوب باللغتين.', 'Item name is required in both languages.'));
      return;
    }

    if (form.price <= 0) {
      setError(t('السعر يجب أن يكون أكبر من صفر.', 'Price must be greater than zero.'));
      return;
    }

    try {
      setSaving(true);
      setError('');
      await upsertItem(form);
      setForm(EMPTY_FORM);
      notify(t('تم حفظ الصنف.', 'Item saved.'));
      await load();
    } catch {
      setError(t('تعذر حفظ الصنف.', 'Failed to save item.'));
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget?.id) return;
    try {
      setSaving(true);
      await deleteItem(deleteTarget.id);
      setDeleteTarget(null);
      notify(t('تم حذف الصنف.', 'Item deleted.'));
      await load();
    } catch {
      setError(t('تعذر حذف الصنف.', 'Unable to delete item.'));
    } finally {
      setSaving(false);
    }
  }

  function toggleTag(tag: string) {
    setForm((prev) => {
      const has = prev.tags?.includes(tag);
      return {
        ...prev,
        tags: has ? (prev.tags ?? []).filter((t) => t !== tag) : [...(prev.tags ?? []), tag]
      };
    });
  }

  return (
    <div className="space-y-3">
      <Card className="space-y-3 p-4">
        <h3 className="text-lg font-bold">{t('إضافة / تعديل صنف', 'Create / Edit Item')}</h3>

        <select
          className="min-h-11 w-full rounded-2xl border border-border bg-surface px-4"
          value={form.category_id ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value || null }))}
        >
          <option value="">{t('بدون قسم', 'No category')}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {language === 'ar' ? category.name_ar : category.name_en}
            </option>
          ))}
        </select>

        <Input placeholder={t('اسم الصنف بالعربية', 'Arabic item name')} value={form.name_ar} onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))} />
        <Input placeholder={t('اسم الصنف بالإنجليزية', 'English item name')} value={form.name_en} onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))} />
        <Input placeholder={t('وصف عربي', 'Arabic description')} value={form.desc_ar ?? ''} onChange={(e) => setForm((f) => ({ ...f, desc_ar: e.target.value }))} />
        <Input placeholder={t('وصف إنجليزي', 'English description')} value={form.desc_en ?? ''} onChange={(e) => setForm((f) => ({ ...f, desc_en: e.target.value }))} />
        <Input type="number" placeholder={t('السعر', 'Price')} value={String(form.price)} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value || 0) }))} />

        <div className="space-y-2">
          <p className="text-sm text-muted">{t('الوسوم', 'Tags')}</p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <Chip key={tag} active={Boolean(form.tags?.includes(tag))} onClick={() => toggleTag(tag)}>
                {tag}
              </Chip>
            ))}
          </div>
        </div>

        <div className="h-28 w-full overflow-hidden rounded-2xl border border-border bg-surface2">
          {form.image_url ? <img src={form.image_url} alt={t('معاينة الصورة', 'Image preview')} className="h-full w-full object-cover" loading="lazy" decoding="async" /> : <div className="h-full w-full bg-gradient-to-br from-surface2 to-surface" aria-hidden="true" />}
        </div>
        <input aria-label={t('رفع صورة', 'Upload image')} type="file" accept="image/*" onChange={(e) => void onUpload(e.target.files?.[0] ?? null)} />

        <Input
          placeholder={t('ترتيب العرض', 'Sort order')}
          type="number"
          value={String(form.sort_order ?? 0)}
          onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value || 0) }))}
        />

        <label className="flex min-h-11 items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={Boolean(form.is_available)} onChange={(e) => setForm((f) => ({ ...f, is_available: e.target.checked }))} />
          {t('متاح', 'Available')}
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <Button className="w-full" onClick={saveItem} disabled={saving}>
          {saving ? t('جارٍ الحفظ...', 'Saving...') : t('حفظ الصنف', 'Save item')}
        </Button>
      </Card>

      <Card className="space-y-3 p-4">
        <h3 className="text-lg font-bold">{t('قائمة الأصناف', 'Items list')}</h3>
        <div className="grid grid-cols-1 gap-2">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('بحث...', 'Search...')} />
          <select className="min-h-11 w-full rounded-2xl border border-border bg-surface px-4" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">{t('كل الأقسام', 'All categories')}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {language === 'ar' ? category.name_ar : category.name_en}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : filteredItems.map((item) => (
          <div key={item.id ?? item.name_en} className="rounded-2xl border border-border bg-surface2 p-3">
            <p className="font-semibold">{language === 'ar' ? item.name_ar : item.name_en}</p>
            <p className="text-sm text-muted">{item.price}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => setForm(item)}>
                {t('تعديل', 'Edit')}
              </Button>
              <Button variant="secondary" onClick={() => setDeleteTarget(item)}>
                {t('حذف', 'Delete')}
              </Button>
            </div>
          </div>
        ))}
      </Card>

      <BottomSheet open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title={t('تأكيد الحذف', 'Confirm delete')}>
        <p className="text-sm text-muted">{t('هل تريد حذف هذا الصنف؟', 'Do you want to delete this item?')}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            {t('إلغاء', 'Cancel')}
          </Button>
          <Button onClick={confirmDelete} disabled={saving}>
            {t('تأكيد', 'Confirm')}
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
