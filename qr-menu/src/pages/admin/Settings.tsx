import { useEffect, useState } from 'react';
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
    <Card className="space-y-3 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">{t('إعدادات المطعم', 'Restaurant settings')}</h3>
        <Button variant="ghost" onClick={() => void load()}>{t('تحديث', 'Refresh')}</Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-11 w-full rounded-full" />
          <Skeleton className="h-11 w-full rounded-full" />
          <Skeleton className="h-11 w-full rounded-full" />
        </div>
      ) : (
        <>
          <Input value={form.restaurant_name_ar} onChange={(e) => setForm((f) => ({ ...f, restaurant_name_ar: e.target.value }))} placeholder={t('اسم المطعم بالعربية', 'Restaurant name (AR)')} />
          <Input value={form.restaurant_name_en} onChange={(e) => setForm((f) => ({ ...f, restaurant_name_en: e.target.value }))} placeholder={t('اسم المطعم بالإنجليزية', 'Restaurant name (EN)')} />
          <Input value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value.toUpperCase() }))} placeholder={t('العملة', 'Currency')} />
        </>
      )}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button className="w-full" onClick={() => void save()} disabled={saving || loading}>{saving ? t('جارٍ الحفظ...', 'Saving...') : t('حفظ الإعدادات', 'Save settings')}</Button>
    </Card>
  );
}
