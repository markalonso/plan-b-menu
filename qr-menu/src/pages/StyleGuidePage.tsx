import { useState } from 'react';
import BottomSheet from '../components/BottomSheet';
import Button from '../components/Button';
import Card from '../components/Card';
import Chip from '../components/Chip';
import Input from '../components/Input';
import Section from '../components/Section';
import Skeleton from '../components/Skeleton';
import Tabs from '../components/Tabs';
import { useLanguage } from '../lib/language';

export default function StyleGuidePage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState('All');
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <main className="pb-6">
      <Section eyebrow="Dev Only" title={t('دليل النمط', 'Style Guide')}>
        <Tabs items={['All', 'Hot', 'New', 'Dessert']} value={tab} onChange={setTab} />

        <Card className="space-y-4">
          <h3 className="text-lg font-bold">Buttons</h3>
          <div className="grid grid-cols-1 gap-2">
            <Button>{t('زر أساسي', 'Primary Button')}</Button>
            <Button variant="secondary">{t('زر ثانوي', 'Secondary Button')}</Button>
            <Button variant="ghost">{t('زر شفاف', 'Ghost Button')}</Button>
          </div>
        </Card>

        <Card className="space-y-4">
          <h3 className="text-lg font-bold">Inputs & Chips</h3>
          <Input placeholder={t('ابحث في القائمة', 'Search menu')} />
          <div className="flex flex-wrap gap-2">
            <Chip active>{t('شائع', 'Popular')}</Chip>
            <Chip>{t('جديد', 'New')}</Chip>
            <Chip>{t('حار', 'Spicy')}</Chip>
          </div>
        </Card>

        <Card className="space-y-3">
          <h3 className="text-lg font-bold">Skeleton</h3>
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-10 w-1/3 rounded-full" />
        </Card>

        <Button className="w-full" onClick={() => setSheetOpen(true)}>
          {t('افتح الـ Bottom Sheet', 'Open Bottom Sheet')}
        </Button>
      </Section>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={t('نموذج معاينة', 'Preview sheet')}>
        <p className="text-muted">{t('هذا مثال بسيط لعرض المحتوى في نافذة سفلية.', 'A simple example of presenting content in a mobile bottom sheet.')}</p>
      </BottomSheet>
    </main>
  );
}
