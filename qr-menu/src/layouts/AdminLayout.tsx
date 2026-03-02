import { Link, Outlet } from 'react-router-dom';
import Container from '../components/Container';
import LanguageToggle from '../components/LanguageToggle';
import { useLanguage } from '../lib/language';

export default function AdminLayout() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-bg pb-10 pt-6 text-text">
      <Container>
        <header className="mb-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{t('لوحة الإدارة', 'Admin Panel')}</h1>
            <LanguageToggle />
          </div>
          <Link className="inline-flex min-h-11 items-center text-sm font-medium text-accent" to="/">
            {t('العودة إلى القائمة', 'Back to Menu')}
          </Link>
        </header>
        <Outlet />
      </Container>
    </div>
  );
}
