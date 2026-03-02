import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Skeleton from '../../components/Skeleton';
import { getSettings, updateSettings, type Settings } from '../../lib/api/menu';
import { useLanguage } from '../../lib/language';

type Props = {
  notify: (message: string) => void;
};

const DEFAULT_SETTINGS: Settings = {
  id: 1,
  restaurant_name_ar: 'Plan B',
  restaurant_name_en: 'Plan B',
  currency: 'EGP'
};

export default function SettingsSection({ notify }: Props) {
  const { t } = useLanguage();
  const [form, setForm] = useState<Settings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getSettings();
        setForm(data);
      } catch {
        setError(t('تعذر تحميل الإعدادات.', 'Unable to load settings.'));
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [t]);

  async function onSave() {
    if (!form.restaurant_name_ar.trim() || !form.restaurant_name_en.trim()) {
      setError(t('اسم المطعم مطلوب باللغتين.', 'Restaurant name is required in both languages.'));
      return;
    }

    try {
      setSaving(true);
      setError('');
      const updated = await updateSettings(form);
      setForm(updated);
      notify(t('تم حفظ الإعدادات.', 'Settings saved.'));
    } catch {
      setError(t('تعذر حفظ الإعدادات.', 'Failed to save settings.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="space-y-3 p-4">
      <h3 className="text-lg font-bold">{t('إعدادات المطعم', 'Restaurant settings')}</h3>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-11 w-full rounded-full" />
          <Skeleton className="h-11 w-full rounded-full" />
          <Skeleton className="h-11 w-full rounded-full" />
        </div>
      ) : (
      <>
      <Input
        placeholder={t('اسم المطعم بالعربية', 'Restaurant name (AR)')}
        value={form.restaurant_name_ar}
        onChange={(e) => setForm((f) => ({ ...f, restaurant_name_ar: e.target.value }))}
      />
      <Input
        placeholder={t('اسم المطعم بالإنجليزية', 'Restaurant name (EN)')}
        value={form.restaurant_name_en}
        onChange={(e) => setForm((f) => ({ ...f, restaurant_name_en: e.target.value }))}
      />
      <Input placeholder={t('العملة', 'Currency')} value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value.toUpperCase() }))} />
      </>
      )}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button onClick={onSave} disabled={saving} className="w-full">
        {saving ? t('جارٍ الحفظ...', 'Saving...') : t('حفظ الإعدادات', 'Save settings')}
      </Button>
    </Card>
  );
}
