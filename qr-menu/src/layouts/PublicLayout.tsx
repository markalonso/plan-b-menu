import { Outlet } from 'react-router-dom';
import Container from '../components/Container';
import { useLanguage } from '../lib/language';

export default function PublicLayout() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-bg pb-10 text-text">
      <Container className="pt-4 md:pt-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,820px)] lg:items-start lg:justify-center">
          <aside className="hidden lg:block lg:sticky lg:top-8">
            <div className="rounded-3xl bg-[rgba(255,255,255,0.72)] p-6 shadow-soft backdrop-blur-sm">
              <p className="text-sm uppercase tracking-[0.24em] text-muted">Plan B</p>
              <h2 className="mt-3 font-heading text-4xl leading-tight">{t('تجربة قائمة راقية', 'A premium dining menu')}</h2>
              <p className="mt-3 text-sm text-muted">{t('تصميم هادئ يوصل الضيافة قبل الطلب.', 'Calm digital hospitality before the first order.')}</p>
            </div>
          </aside>
          <div className="min-w-0 lg:mx-auto lg:w-full lg:max-w-[820px]">
            <Outlet />
          </div>
        </div>
      </Container>
    </div>
  );
}
