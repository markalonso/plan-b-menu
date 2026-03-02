import { useEffect, useMemo, useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import Toast from '../components/Toast';
import { getSession, onAuthStateChange, signIn, signOut } from '../lib/auth';
import { isAdmin } from '../lib/api/menu';
import { useLanguage } from '../lib/language';
import Categories from './admin/Categories';
import Items from './admin/Items';
import SettingsSection from './admin/Settings';

type Section = 'categories' | 'items' | 'settings';

export default function Admin() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState('');
  const [section, setSection] = useState<Section>('categories');
  const [toast, setToast] = useState('');

  const sections = useMemo(
    () => [
      { key: 'categories' as Section, label: t('الأقسام', 'Categories') },
      { key: 'items' as Section, label: t('الأصناف', 'Items') },
      { key: 'settings' as Section, label: t('الإعدادات', 'Settings') }
    ],
    [t]
  );

  useEffect(() => {
    let mounted = true;

    async function check() {
      try {
        const session = await getSession();
        if (!mounted) return;
        if (!session?.user) {
          setLoggedIn(false);
          setAuthorized(false);
          return;
        }

        setLoggedIn(true);
        const adminOk = await isAdmin(session.user.id);
        if (!mounted) return;
        setAuthorized(adminOk);
      } catch {
        if (mounted) setError(t('تعذر التحقق من الجلسة.', 'Unable to verify session.'));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void check();

    const unsub = onAuthStateChange(() => {
      void check();
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, [t]);

  async function handleSignIn() {
    if (!email || !password) {
      setError(t('يرجى إدخال البريد وكلمة المرور.', 'Please provide email and password.'));
      return;
    }

    try {
      setSaving(true);
      setError('');
      await signIn(email, password);
      setToast(t('تم تسجيل الدخول.', 'Signed in successfully.'));
    } catch {
      setError(t('فشل تسجيل الدخول.', 'Login failed.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try {
      await signOut();
      setToast(t('تم تسجيل الخروج.', 'Signed out.'));
    } catch {
      setError(t('تعذر تسجيل الخروج.', 'Unable to sign out.'));
    }
  }

  if (loading) {
    return (
      <Card className="space-y-2 p-4">
        <div className="h-5 w-1/2 animate-pulse rounded bg-surface2" />
        <div className="h-11 w-full animate-pulse rounded-full bg-surface2" />
      </Card>
    );
  }

  if (!loggedIn) {
    return (
      <>
        <Card className="space-y-3 p-4">
          <h2 className="text-xl font-bold">{t('تسجيل دخول الإدارة', 'Admin Login')}</h2>
          <Input type="email" placeholder={t('البريد الإلكتروني', 'Email')} value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder={t('كلمة المرور', 'Password')} value={password} onChange={(e) => setPassword(e.target.value)} />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button className="w-full" onClick={handleSignIn} disabled={saving}>
            {saving ? t('جارٍ الدخول...', 'Signing in...') : t('دخول', 'Sign in')}
          </Button>
        </Card>
        <Toast message={toast} open={Boolean(toast)} onClose={() => setToast('')} />
      </>
    );
  }

  if (!authorized) {
    return (
      <>
        <Card className="space-y-3 p-4 text-center">
          <h2 className="text-xl font-bold">{t('غير مصرح', 'Not authorized')}</h2>
          <p className="text-sm text-muted">{t('هذا الحساب ليس ضمن قائمة المدراء.', 'This account is not in the admins list.')}</p>
          <Button variant="secondary" className="w-full" onClick={handleLogout}>
            {t('تسجيل الخروج', 'Logout')}
          </Button>
        </Card>
        <Toast message={toast} open={Boolean(toast)} onClose={() => setToast('')} />
      </>
    );
  }

  return (
    <>
      <div className="space-y-3 pb-24">
        <Card className="p-3">
          <div className="grid grid-cols-3 gap-2">
            {sections.map((tab) => (
              <Button key={tab.key} variant={section === tab.key ? 'primary' : 'secondary'} onClick={() => setSection(tab.key)}>
                {tab.label}
              </Button>
            ))}
          </div>
        </Card>

        {section === 'categories' ? <Categories notify={setToast} /> : null}
        {section === 'items' ? <Items notify={setToast} /> : null}
        {section === 'settings' ? <SettingsSection notify={setToast} /> : null}
      </div>

      <div className="fixed inset-x-4 bottom-20">
        <Button className="w-full" variant="ghost" onClick={handleLogout}>
          {t('تسجيل الخروج', 'Logout')}
        </Button>
      </div>

      <Toast message={toast} open={Boolean(toast)} onClose={() => setToast('')} />
    </>
  );
}
