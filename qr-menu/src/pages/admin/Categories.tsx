import { useEffect, useMemo, useState } from 'react';
import BottomSheet from '../../components/BottomSheet';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import Input from '../../components/Input';
import Skeleton from '../../components/Skeleton';
import { deleteCategory, getCategories, type Category, upsertCategory } from '../../lib/api/menu';
import { useLanguage } from '../../lib/language';

type Props = {
  notify: (message: string) => void;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const EMPTY_FORM: Category = {
  name_ar: '',
  name_en: '',
  slug: '',
  sort_order: 0,
  is_active: true
};

export default function Categories({ notify }: Props) {
  const { language, t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<Category>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [error, setError] = useState('');

  const sorted = useMemo(
    () => [...categories].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    [categories]
  );

  async function load() {
    try {
      setLoading(true);
      setCategories(await getCategories());
    } catch {
      setError(t('تعذر تحميل الأقسام.', 'Unable to load categories.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function saveCategory() {
    if (!form.name_ar.trim() || !form.name_en.trim()) {
      setError(t('الاسم بالعربية والإنجليزية مطلوب.', 'Arabic and English names are required.'));
      return;
    }

    const resolvedSlug = (form.slug || slugify(form.name_en)).trim();
    if (!resolvedSlug) {
      setError(t('الـ slug مطلوب.', 'Slug is required.'));
      return;
    }

    try {
      setSaving(true);
      setError('');
      await upsertCategory({ ...form, slug: resolvedSlug });
      setForm(EMPTY_FORM);
      notify(t('تم حفظ القسم.', 'Category saved.'));
      await load();
    } catch {
      setError(t('فشل حفظ القسم. تحقق من البيانات.', 'Failed to save category. Check your values.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
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

  async function move(category: Category, step: number) {
    const nextOrder = (category.sort_order ?? 0) + step;
    try {
      await upsertCategory({ ...category, sort_order: nextOrder });
      await load();
    } catch {
      setError(t('تعذر إعادة الترتيب.', 'Unable to reorder.'));
    }
  }

  return (
    <div className="space-y-3">
      <Card className="space-y-3 p-4">
        <h3 className="text-lg font-bold">{t('إضافة / تعديل قسم', 'Create / Edit Category')}</h3>
        <Input placeholder={t('الاسم بالعربية', 'Arabic name')} value={form.name_ar} onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))} />
        <Input placeholder={t('الاسم بالإنجليزية', 'English name')} value={form.name_en} onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))} />
        <Input
          placeholder={t('Slug (اختياري)', 'Slug (optional)')}
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
        />
        <Input
          placeholder={t('ترتيب العرض', 'Sort order')}
          type="number"
          value={String(form.sort_order ?? 0)}
          onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value || 0) }))}
        />
        <label className="flex min-h-11 items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={Boolean(form.is_active)}
            onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
          />
          {t('قسم نشط', 'Active category')}
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button onClick={saveCategory} disabled={saving} className="w-full">
          {saving ? t('جارٍ الحفظ...', 'Saving...') : t('حفظ القسم', 'Save category')}
        </Button>
      </Card>

      <Card className="space-y-3 p-4">
        <h3 className="text-lg font-bold">{t('الأقسام', 'Categories')}</h3>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          sorted.map((category) => (
            <div key={category.id ?? category.slug} className="rounded-2xl border border-border bg-surface2 p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{language === 'ar' ? category.name_ar : category.name_en}</p>
                  <p className="text-xs text-muted">/{category.slug}</p>
                </div>
                <Chip active={Boolean(category.is_active)}>{category.is_active ? t('نشط', 'Active') : t('مخفي', 'Hidden')}</Chip>
              </div>
              <div className="mt-2 grid grid-cols-4 gap-2">
                <Button variant="ghost" onClick={() => move(category, -1)}>
                  ↑
                </Button>
                <Button variant="ghost" onClick={() => move(category, 1)}>
                  ↓
                </Button>
                <Button variant="secondary" onClick={() => setForm(category)}>
                  {t('تعديل', 'Edit')}
                </Button>
                <Button variant="secondary" onClick={() => setDeleteTarget(category)}>
                  {t('حذف', 'Delete')}
                </Button>
              </div>
            </div>
          ))
        )}
      </Card>

      <BottomSheet open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title={t('تأكيد الحذف', 'Confirm delete')}>
        <p className="text-sm text-muted">{t('هل تريد حذف هذا القسم؟', 'Do you want to delete this category?')}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            {t('إلغاء', 'Cancel')}
          </Button>
          <Button onClick={handleDelete} disabled={saving}>
            {t('تأكيد', 'Confirm')}
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
