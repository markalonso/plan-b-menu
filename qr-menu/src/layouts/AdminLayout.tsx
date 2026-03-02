import { Link, Outlet } from 'react-router-dom';
import Container from '../components/Container';
import LanguageToggle from '../components/LanguageToggle';
import { useLanguage } from '../lib/language';

export default function AdminLayout() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-bg pb-10 pt-6 text-text">
      <Container>
        <header className="mb-5 space-y-3 rounded-3xl bg-[rgba(255,255,255,0.75)] p-4 shadow-soft backdrop-blur-sm">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-heading text-3xl font-semibold tracking-tight">{t('لوحة الإدارة', 'Admin Panel')}</h1>
            <LanguageToggle />
          </div>
          <Link className="inline-flex min-h-11 items-center rounded-full bg-[color:var(--accentSoft)] px-4 text-sm font-medium text-accent" to="/">
            {t('العودة إلى القائمة', 'Back to Menu')}
          </Link>
        </header>
        <Outlet />
      </Container>
    </div>
  );
}
