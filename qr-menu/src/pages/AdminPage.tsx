import { useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import Section from '../components/Section';
import Toast from '../components/Toast';
import { useLanguage } from '../lib/language';

export default function AdminPage() {
  const [toastOpen, setToastOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      <main>
        <Section eyebrow={t('إدارة المحتوى', 'Content management')} title={t('تعديل عنصر القائمة', 'Update menu item')}>
          <Card className="space-y-3">
            <Input placeholder={t('اسم الطبق', 'Item name')} />
            <Input placeholder={t('السعر', 'Price')} type="number" />
            <Button className="w-full" onClick={() => setToastOpen(true)}>
              {t('حفظ التغييرات', 'Save changes')}
            </Button>
          </Card>
        </Section>
      </main>
      <Toast message={t('تم حفظ التغييرات بنجاح', 'Changes saved successfully')} open={toastOpen} onClose={() => setToastOpen(false)} />
    </>
  );
}
