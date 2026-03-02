import { ReactNode, useEffect, useState } from 'react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Skeleton from '../../components/Skeleton';
import { getSettings, updateSettings, type Settings } from '../../lib/api/menu';
import { useLanguage } from '../../lib/language';

const fallbackSettings: Settings = {
  id: 1,
  restaurant_name_ar: 'Plan B',
  restaurant_name_en: 'Plan B',
  currency: 'EGP'
};

function FloatingField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="relative block">
      {children}
      <span className="pointer-events-none absolute start-4 top-2 text-xs font-medium text-muted">{label}</span>
    </label>
  );
}

export default function SettingsSection({ notify }: { notify: (msg: string) => void }) {
  const { t } = useLanguage();
  const [form, setForm] = useState<Settings>(fallbackSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      setError('');
      setForm(await getSettings());
    } catch {
      setError(t('تعذر تحميل الإعدادات.', 'Unable to load settings.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function save() {
    if (!form.restaurant_name_ar.trim() || !form.restaurant_name_en.trim()) {
      return setError(t('اسم المطعم مطلوب باللغتين.', 'Restaurant name is required in both languages.'));
    }

    try {
      setSaving(true);
      setError('');
      const updated = await updateSettings({ ...form, id: 1 });
      setForm(updated);
      notify(t('تم حفظ الإعدادات.', 'Settings saved.'));
    } catch {
      setError(t('تعذر حفظ الإعدادات.', 'Unable to save settings.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="space-y-4 rounded-3xl bg-surface/95 p-5 shadow-elevate backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-heading text-xl font-semibold">{t('إعدادات المطعم', 'Restaurant settings')}</h3>
        <Button variant="secondary" onClick={() => void load()}>
          {t('تحديث', 'Refresh')}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
      ) : (
        <>
          <FloatingField label={t('اسم المطعم بالعربية', 'Restaurant name (AR)')}>
            <Input value={form.restaurant_name_ar} onChange={(e) => setForm((f) => ({ ...f, restaurant_name_ar: e.target.value }))} placeholder=" " className="pt-6" />
          </FloatingField>
          <FloatingField label={t('اسم المطعم بالإنجليزية', 'Restaurant name (EN)')}>
            <Input value={form.restaurant_name_en} onChange={(e) => setForm((f) => ({ ...f, restaurant_name_en: e.target.value }))} placeholder=" " className="pt-6" />
          </FloatingField>
          <FloatingField label={t('العملة', 'Currency')}>
            <Input value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value.toUpperCase() }))} placeholder=" " className="pt-6" />
          </FloatingField>
        </>
      )}

      {error ? <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}
      <Button className="w-full" onClick={() => void save()} disabled={saving || loading}>
        {saving ? t('جارٍ الحفظ...', 'Saving...') : t('حفظ الإعدادات', 'Save settings')}
      </Button>
    </Card>
  );
}
