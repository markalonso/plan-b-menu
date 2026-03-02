import { useEffect, useMemo, useState } from 'react';
import BottomSheet from '../../components/BottomSheet';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import Input from '../../components/Input';
import Skeleton from '../../components/Skeleton';
import { deleteCategory, getCategories, type Category, upsertCategory } from '../../lib/api/menu';
import { useLanguage } from '../../lib/language';

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const emptyForm: Category = {
  name_ar: '',
  name_en: '',
  slug: '',
  sort_order: 0,
  is_active: true
};

export default function Categories({ notify }: { notify: (msg: string) => void }) {
  const { language, t } = useLanguage();
  const [rows, setRows] = useState<Category[]>([]);
  const [form, setForm] = useState<Category>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const sorted = useMemo(() => [...rows].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)), [rows]);

  async function load() {
    try {
      setLoading(true);
      setError('');
      setRows(await getCategories());
    } catch {
      setError(t('تعذر تحميل الأقسام.', 'Unable to load categories.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function save() {
    if (!form.name_ar.trim()) return setError(t('الاسم العربي مطلوب.', 'Arabic name is required.'));
    if (!form.name_en.trim()) return setError(t('الاسم الإنجليزي مطلوب.', 'English name is required.'));

    const slug = (form.slug || slugify(form.name_en)).trim();
    if (!slug) return setError(t('Slug مطلوب.', 'Slug is required.'));

    try {
      setSaving(true);
      setError('');
      await upsertCategory({ ...form, slug });
      setForm(emptyForm);
      notify(t('تم حفظ القسم.', 'Category saved.'));
      await load();
    } catch {
      setError(t('فشل حفظ القسم. قد يكون Slug مستخدمًا بالفعل.', 'Failed to save category. Slug may already exist.'));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!deleteTarget?.id) return;
    try {
      setSaving(true);
      await deleteCategory(deleteTarget.id);
      setDeleteTarget(null);
      notify(t('تم حذف القسم.', 'Category deleted.'));
      await load();
    } catch {
      setError(t('تعذر حذف القسم.', 'Unable to delete category.'));
    } finally {
      setSaving(false);
    }
  }

  async function quickSort(row: Category, direction: -1 | 1) {
    try {
      await upsertCategory({ ...row, sort_order: (row.sort_order ?? 0) + direction });
      await load();
    } catch {
      setError(t('تعذر تعديل الترتيب.', 'Unable to update order.'));
    }
  }

  return (
    <div className="space-y-3">
      <Card className="space-y-3 p-4">
        <h3 className="text-lg font-bold">{t('إضافة / تعديل قسم', 'Create / Edit Category')}</h3>
        <Input placeholder={t('الاسم بالعربية', 'Arabic name')} value={form.name_ar} onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))} />
        <Input
          placeholder={t('الاسم بالإنجليزية', 'English name')}
          value={form.name_en}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              name_en: e.target.value,
              slug: f.slug ? f.slug : slugify(e.target.value)
            }))
          }
        />
        <Input placeholder="slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
        <Input type="number" placeholder={t('ترتيب العرض', 'Sort order')} value={String(form.sort_order ?? 0)} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value || 0) }))} />
        <label className="flex min-h-11 items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={Boolean(form.is_active)} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
          {t('قسم نشط', 'Active category')}
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button className="w-full" onClick={save} disabled={saving}>
          {saving ? t('جارٍ الحفظ...', 'Saving...') : t('حفظ القسم', 'Save category')}
        </Button>
      </Card>

      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">{t('الأقسام', 'Categories')}</h3>
          <Button variant="ghost" onClick={() => void load()}>{t('تحديث', 'Refresh')}</Button>
        </div>

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : sorted.length === 0 ? (
          <p className="text-sm text-muted">{t('لا توجد أقسام بعد.', 'No categories yet.')}</p>
        ) : (
          sorted.map((row) => (
            <div key={row.id ?? row.slug} className="rounded-2xl border border-border bg-surface2 p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{language === 'ar' ? row.name_ar : row.name_en}</p>
                  <p className="text-xs text-muted">/{row.slug} • #{row.sort_order ?? 0}</p>
                </div>
                <Chip active={Boolean(row.is_active)}>{row.is_active ? t('نشط', 'Active') : t('مخفي', 'Hidden')}</Chip>
              </div>
              <div className="mt-2 grid grid-cols-4 gap-2">
                <Button variant="ghost" onClick={() => void quickSort(row, -1)} aria-label={t('رفع', 'Move up')}>↑</Button>
                <Button variant="ghost" onClick={() => void quickSort(row, 1)} aria-label={t('خفض', 'Move down')}>↓</Button>
                <Button variant="secondary" onClick={() => setForm(row)}>{t('تعديل', 'Edit')}</Button>
                <Button variant="secondary" onClick={() => setDeleteTarget(row)}>{t('حذف', 'Delete')}</Button>
              </div>
            </div>
          ))
        )}
      </Card>

      <BottomSheet open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title={t('تأكيد الحذف', 'Confirm delete')}>
        <p className="text-sm text-muted">{t('سيتم حذف القسم، والأصناف المرتبطة ستصبح بدون قسم. هل تريد المتابعة؟', 'This will delete the category and linked items will become uncategorized. Continue?')}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>{t('إلغاء', 'Cancel')}</Button>
          <Button onClick={() => void remove()} disabled={saving}>{t('تأكيد', 'Confirm')}</Button>
        </div>
      </BottomSheet>
    </div>
  );
}
