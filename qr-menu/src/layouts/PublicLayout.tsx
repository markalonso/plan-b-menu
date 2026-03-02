import { Outlet } from 'react-router-dom';
import { useLanguage } from '../lib/language';

export default function PublicLayout() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Identity strip — visible on desktop as ambient brand marker */}
      <div className="hidden lg:block border-b border-[var(--divider)]">
        <div className="mx-auto flex max-w-[860px] items-center justify-between px-8 py-3">
          <span className="text-xs uppercase tracking-[0.3em] text-muted/70">Plan B</span>
          <span className="text-xs text-muted/50">{t('قائمة رقمية', 'Digital Menu')}</span>
        </div>
      </div>

      {/* Content canvas — centered, max-width constrained, breathing margins */}
      <div className="mx-auto w-full max-w-[860px] px-4 sm:px-6 lg:px-8 pb-32 pt-4 lg:pt-8">
        <Outlet />
      </div>
    </div>
  );
}
