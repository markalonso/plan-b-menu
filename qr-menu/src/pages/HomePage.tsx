import { useState } from 'react';
import BottomSheet from '../components/BottomSheet';
import Button from '../components/Button';
import Card from '../components/Card';
import Section from '../components/Section';
import Tabs from '../components/Tabs';
import { useLanguage } from '../lib/language';

const categoriesAr = ['المقبلات', 'الأطباق الرئيسية', 'الحلويات', 'المشروبات'];
const categoriesEn = ['Starters', 'Mains', 'Desserts', 'Drinks'];

export default function HomePage() {
  const [open, setOpen] = useState(false);
  const { t, language } = useLanguage();
  const categories = language === 'ar' ? categoriesAr : categoriesEn;
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  return (
    <main>
      <Section eyebrow={t('تجربة راقية وهادئة', 'Calm premium experience')} title={t('اكتشف قائمتنا', 'Explore Our Menu')}>
        <Tabs items={categories} value={activeCategory} onChange={setActiveCategory} sticky />

        <Card>
          <p className="text-sm text-muted">{t('اختيار اليوم', 'Today’s signature')}</p>
          <h3 className="mt-1 text-2xl font-bold">{t('باستا المأكولات البحرية بالزعفران', 'Saffron Seafood Pasta')}</h3>
          <p className="mt-2 text-base text-muted">
            {t('أعشاب طازجة، صوص كريمي خفيف ولمسة حمضية متوازنة.', 'Fresh herbs, creamy sauce, and a bright citrus finish.')}
          </p>
          <Button className="mt-4 w-full" onClick={() => setOpen(true)}>
            {t('عرض التفاصيل', 'View details')}
          </Button>
        </Card>
      </Section>

      <BottomSheet open={open} onClose={() => setOpen(false)} title={t('تفاصيل الطبق', 'Dish details')}>
        <p className="text-base text-muted">
          {t('هذا نموذج لبطاقة سفلية مناسبة للموبايل مع مساحات مريحة ولمسات بصرية ناعمة.', 'A mobile-first bottom sheet with generous spacing and subtle visual cues.')}
        </p>
      </BottomSheet>
    </main>
  );
}
