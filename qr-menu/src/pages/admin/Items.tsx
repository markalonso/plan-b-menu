import { ReactNode, useEffect, useMemo, useState } from 'react';
import BottomSheet from '../../components/BottomSheet';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import Input from '../../components/Input';
import Skeleton from '../../components/Skeleton';
import { deleteItem, getCategories, getItems, type Category, type MenuItem, upsertItem, uploadMenuImage } from '../../lib/api/menu';
import { useLanguage } from '../../lib/language';

const TAGS = ['New', 'Popular', 'Spicy', 'Vegan'];

const emptyForm: MenuItem = {
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

function FloatingField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="relative block">
      {children}
      <span className="pointer-events-none absolute start-4 top-2 text-xs font-medium text-muted">{label}</span>
    </label>
  );
}

export default function Items({ notify }: { notify: (msg: string) => void }) {
  const { language, t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [rows, setRows] = useState<MenuItem[]>([]);
  const [form, setForm] = useState<MenuItem>(emptyForm);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError('');
      const [cats, items] = await Promise.all([getCategories(), getItems()]);
      setCategories(cats);
      setRows(
        [...items].sort((a, b) => {
          const c1 = a.category_id ?? 'zzz';
          const c2 = b.category_id ?? 'zzz';
          if (c1 !== c2) return c1.localeCompare(c2);
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

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return rows.filter((item) => {
      const inCat = categoryFilter === 'all' || item.category_id === categoryFilter;
      if (!inCat) return false;
      if (!q) return true;
      return `${item.name_ar} ${item.name_en}`.toLowerCase().includes(q);
    });
  }, [rows, search, categoryFilter]);

  async function upload(file: File | null) {
    if (!file) return;

    try {
      setUploading(true);
      const itemId = form.id ?? crypto.randomUUID();
      const categorySlug = categories.find((c) => c.id === form.category_id)?.slug ?? 'uncategorized';
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${categorySlug}/${itemId}-${Date.now()}.${ext}`;
      const url = await uploadMenuImage(file, path);
      setForm((prev) => ({ ...prev, id: itemId, image_url: url }));
      notify(t('تم رفع الصورة بنجاح.', 'Image uploaded successfully.'));
    } catch {
      setError(t('فشل رفع الصورة.', 'Image upload failed.'));
    } finally {
      setUploading(false);
    }
  }

  function toggleTag(tag: string) {
    setForm((prev) => {
      const exists = prev.tags?.includes(tag);
      return { ...prev, tags: exists ? (prev.tags ?? []).filter((t) => t !== tag) : [...(prev.tags ?? []), tag] };
    });
  }

  async function save() {
    if (!form.name_ar.trim()) return setError(t('الاسم العربي مطلوب.', 'Arabic name is required.'));
    if (!form.name_en.trim()) return setError(t('الاسم الإنجليزي مطلوب.', 'English name is required.'));
    if (Number(form.price) <= 0) return setError(t('السعر يجب أن يكون أكبر من صفر.', 'Price must be greater than zero.'));

    try {
      setSaving(true);
      setError('');
      await upsertItem({ ...form, price: Number(form.price) });
      setForm(emptyForm);
      notify(t('تم حفظ الصنف.', 'Item saved.'));
      await load();
    } catch {
      setError(t('تعذر حفظ الصنف.', 'Failed to save item.'));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
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

  return (
    <div className="space-y-4">
      <Card className="space-y-4 rounded-3xl bg-surface/95 p-5 shadow-elevate backdrop-blur-sm">
        <h3 className="font-heading text-xl font-semibold">{t('إضافة / تعديل صنف', 'Create / Edit Item')}</h3>

        <label className="relative block">
          <select className="min-h-14 w-full rounded-2xl border border-border/70 bg-surface px-4 pt-6" value={form.category_id ?? ''} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value || null }))}>
            <option value="">{t('بدون قسم', 'No category')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{language === 'ar' ? c.name_ar : c.name_en}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute start-4 top-2 text-xs font-medium text-muted">{t('القسم', 'Category')}</span>
        </label>

        <FloatingField label={t('الاسم بالعربية', 'Arabic name')}>
          <Input placeholder=" " className="pt-6" value={form.name_ar} onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))} />
        </FloatingField>
        <FloatingField label={t('الاسم بالإنجليزية', 'English name')}>
          <Input placeholder=" " className="pt-6" value={form.name_en} onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))} />
        </FloatingField>

        <label className="relative block">
          <textarea className="min-h-24 w-full rounded-2xl border border-border/70 bg-surface px-4 pt-7" placeholder=" " value={form.desc_ar ?? ''} onChange={(e) => setForm((f) => ({ ...f, desc_ar: e.target.value }))} />
          <span className="pointer-events-none absolute start-4 top-2 text-xs font-medium text-muted">{t('الوصف بالعربية', 'Arabic description')}</span>
        </label>

        <label className="relative block">
          <textarea className="min-h-24 w-full rounded-2xl border border-border/70 bg-surface px-4 pt-7" placeholder=" " value={form.desc_en ?? ''} onChange={(e) => setForm((f) => ({ ...f, desc_en: e.target.value }))} />
          <span className="pointer-events-none absolute start-4 top-2 text-xs font-medium text-muted">{t('الوصف بالإنجليزية', 'English description')}</span>
        </label>

        <FloatingField label={t('السعر', 'Price')}>
          <Input type="number" placeholder=" " className="pt-6" value={String(form.price)} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value || 0) }))} />
        </FloatingField>

        <div className="space-y-2 rounded-2xl bg-surface2 p-3">
          <p className="text-sm text-muted">{t('الوسوم', 'Tags')}</p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <Chip key={tag} active={Boolean(form.tags?.includes(tag))} onClick={() => toggleTag(tag)}>{tag}</Chip>
            ))}
          </div>
        </div>

        <FloatingField label={t('ترتيب العرض', 'Sort order')}>
          <Input type="number" placeholder=" " className="pt-6" value={String(form.sort_order ?? 0)} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value || 0) }))} />
        </FloatingField>

        <label className="flex min-h-11 items-center gap-2 rounded-2xl bg-surface2 px-4 text-sm text-muted">
          <input type="checkbox" checked={Boolean(form.is_available)} onChange={(e) => setForm((f) => ({ ...f, is_available: e.target.checked }))} />
          {t('متاح', 'Available')}
        </label>

        <div className="rounded-2xl bg-surface2 p-3">
          <p className="mb-2 text-sm text-muted">{t('معاينة الصورة', 'Image preview')}</p>
          <div className="h-32 w-full overflow-hidden rounded-2xl bg-surface">
            {form.image_url ? <img src={form.image_url} alt={t('معاينة الصورة', 'Image preview')} className="h-full w-full object-cover" loading="lazy" decoding="async" /> : <div className="h-full w-full bg-gradient-to-br from-surface2 to-surface" aria-hidden="true" />}
          </div>
        </div>

        <label className="rounded-2xl bg-surface2 p-3 text-sm text-muted">
          <span>{t('رفع صورة', 'Upload image')}</span>
          <input className="mt-2 block w-full" aria-label={t('رفع صورة', 'Upload image')} type="file" accept="image/*" onChange={(e) => void upload(e.target.files?.[0] ?? null)} />
        </label>
        {uploading ? <p className="text-sm text-muted">{t('جارٍ رفع الصورة...', 'Uploading image...')}</p> : null}

        {error ? <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}
        <Button className="w-full" onClick={() => void save()} disabled={saving || uploading}>{saving ? t('جارٍ الحفظ...', 'Saving...') : t('حفظ الصنف', 'Save item')}</Button>
      </Card>

      <Card className="space-y-4 rounded-3xl bg-surface/95 p-5 shadow-elevate backdrop-blur-sm">
        <div className="grid grid-cols-1 gap-3">
          <FloatingField label={t('بحث بالاسم...', 'Search by name...')}>
            <Input value={search} className="pt-6" placeholder=" " onChange={(e) => setSearch(e.target.value)} />
          </FloatingField>

          <label className="relative block">
            <select className="min-h-14 w-full rounded-2xl border border-border/70 bg-surface px-4 pt-6" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">{t('كل الأقسام', 'All categories')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{language === 'ar' ? c.name_ar : c.name_en}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute start-4 top-2 text-xs font-medium text-muted">{t('فلترة القسم', 'Category filter')}</span>
          </label>
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted">{t('لا توجد أصناف مطابقة.', 'No matching items.')}</p>
        ) : (
          filtered.map((row) => (
            <div key={row.id ?? row.name_en} className="rounded-2xl bg-surface2 p-4 shadow-soft">
              <div className="flex items-center gap-3">
                {row.image_url ? <img src={row.image_url} alt="thumb" className="h-16 w-16 rounded-2xl object-cover" loading="lazy" /> : <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-surface2 to-surface" />}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{language === 'ar' ? row.name_ar : row.name_en}</p>
                  <p className="text-sm text-muted">{row.price}</p>
                </div>
                <Chip active={Boolean(row.is_available)}>{row.is_available ? t('متاح', 'Available') : t('غير متاح', 'Unavailable')}</Chip>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={() => setForm(row)}>{t('تعديل', 'Edit')}</Button>
                <Button variant="secondary" onClick={() => setDeleteTarget(row)}>{t('حذف', 'Delete')}</Button>
              </div>
            </div>
          ))
        )}
      </Card>

      <BottomSheet open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title={t('تأكيد الحذف', 'Confirm delete')}>
        <p className="text-sm text-muted">{t('هل تريد حذف هذا الصنف؟', 'Do you want to delete this item?')}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>{t('إلغاء', 'Cancel')}</Button>
          <Button onClick={() => void remove()} disabled={saving}>{t('تأكيد', 'Confirm')}</Button>
        </div>
      </BottomSheet>
    </div>
  );
}
