import { useEffect, useMemo, useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import Toast from '../components/Toast';
import { onAuthChange, signOut } from '../lib/auth';
import { getAdminStatus } from '../lib/admin/guard';
import { useLanguage } from '../lib/language';
import Login from './admin/Login';
import Categories from './admin/Categories';
import Items from './admin/Items';
import SettingsSection from './admin/Settings';

type Section = 'categories' | 'items' | 'settings' | 'logout';

export default function Admin() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [section, setSection] = useState<Section>('categories');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const nav = useMemo(
    () => [
      { key: 'categories' as Section, label: t('الأقسام', 'Categories') },
      { key: 'items' as Section, label: t('الأصناف', 'Items') },
      { key: 'settings' as Section, label: t('الإعدادات', 'Settings') },
      { key: 'logout' as Section, label: t('خروج', 'Logout') }
    ],
    [t]
  );

  async function refreshAuth() {
    try {
      setLoading(true);
      setError('');
      const status = await getAdminStatus();
      setLoggedIn(Boolean(status.session));
      setAuthorized(status.isAdmin);
    } catch {
      setError(t('تعذر التحقق من صلاحيات الإدارة.', 'Unable to verify admin permissions.'));
      setLoggedIn(false);
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshAuth();
    const unsub = onAuthChange(() => {
      void refreshAuth();
    });
    return unsub;
  }, []);

  async function logout() {
    try {
      await signOut();
      setToast(t('تم تسجيل الخروج.', 'Signed out.'));
      setSection('categories');
    } catch {
      setError(t('تعذر تسجيل الخروج.', 'Unable to sign out.'));
    }
  }

  useEffect(() => {
    if (section === 'logout') {
      void logout();
    }
  }, [section]);

  if (loading) {
    return (
      <Card className="space-y-2 rounded-3xl bg-surface/95 p-4 shadow-elevate">
        <div className="h-5 w-1/2 animate-pulse rounded bg-surface2" />
        <div className="h-11 w-full animate-pulse rounded-full bg-surface2" />
      </Card>
    );
  }

  if (!loggedIn) {
    return (
      <>
        <Login onSuccess={() => void refreshAuth()} />
        <Toast message={toast} open={Boolean(toast)} onClose={() => setToast('')} />
      </>
    );
  }

  if (!authorized) {
    return (
      <>
        <Card className="space-y-3 p-4 text-center">
          <h2 className="text-xl font-bold">{t('غير مصرح', 'Not authorized')}</h2>
          <p className="text-sm text-muted">{t('هذا الحساب ليس ضمن قائمة المدراء.', 'This account is not in the admins table.')}</p>
          <Button variant="secondary" className="w-full" onClick={() => void logout()}>
            {t('تسجيل الخروج', 'Logout')}
          </Button>
        </Card>
        <Toast message={toast} open={Boolean(toast)} onClose={() => setToast('')} />
      </>
    );
  }

  return (
    <>
      <div className="space-y-4 pb-24">
        {error ? (
          <Card className="space-y-2 rounded-3xl bg-surface/95 p-4 shadow-elevate">
            <p className="text-sm text-red-600">{error}</p>
            <Button variant="secondary" onClick={() => void refreshAuth()}>{t('إعادة المحاولة', 'Retry')}</Button>
          </Card>
        ) : null}

        {section === 'categories' ? <Categories notify={setToast} /> : null}
        {section === 'items' ? <Items notify={setToast} /> : null}
        {section === 'settings' ? <SettingsSection notify={setToast} /> : null}
      </div>

      <nav className="fixed inset-x-4 z-40 rounded-3xl bg-[rgba(255,255,255,0.92)] p-2 shadow-elevate backdrop-blur-sm" style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}>
        <div className="grid grid-cols-4 gap-2">
          {nav.map((tab) => (
            <Button key={tab.key} variant={section === tab.key ? 'primary' : 'secondary'} onClick={() => setSection(tab.key)}>
              {tab.label}
            </Button>
          ))}
        </div>
      </nav>

      <Toast message={toast} open={Boolean(toast)} onClose={() => setToast('')} />
    </>
  );
}
