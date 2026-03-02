import { Link, Outlet } from 'react-router-dom';
import Container from '../components/Container';
import LanguageToggle from '../components/LanguageToggle';
import { useLanguage } from '../lib/language';

export default function AdminLayout() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-bg pb-12 text-text">
      {/* Studio console header — dark identity bar */}
      <div className="border-b border-[var(--border)] bg-[var(--text)]">
        <Container className="py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[var(--bg)]/50">Plan B</p>
                <h1 className="font-heading text-xl font-semibold text-[var(--bg)]">{t('لوحة الإدارة', 'Admin Console')}</h1>
              </div>
              <div className="hidden h-8 w-px bg-[var(--bg)]/10 sm:block" aria-hidden="true" />
              <Link
                className="hidden rounded-full border border-[var(--bg)]/20 px-4 py-1.5 text-sm text-[var(--bg)]/70 transition hover:border-[var(--bg)]/40 hover:text-[var(--bg)] sm:inline-flex"
                to="/"
              >
                {t('العودة إلى القائمة', 'Back to Menu')}
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <Link
                className="inline-flex rounded-full border border-[var(--bg)]/20 px-4 py-1.5 text-sm text-[var(--bg)]/70 transition hover:border-[var(--bg)]/40 hover:text-[var(--bg)] sm:hidden"
                to="/"
              >
                {t('القائمة', 'Menu')}
              </Link>
            </div>
          </div>
        </Container>
      </div>

      <Container className="pt-8">
        <Outlet />
      </Container>
    </div>
  );
}
