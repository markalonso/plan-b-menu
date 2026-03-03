import { FormEvent, ReactNode, useState } from 'react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import { signIn } from '../../lib/auth';
import { useLanguage } from '../../lib/language';

function FloatingField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="relative block">
      {children}
      <span className="pointer-events-none absolute start-4 top-2 text-xs font-medium text-muted">{label}</span>
    </label>
  );
}

export default function Login({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();

    if (!email || !password) {
      setError(t('يرجى إدخال البريد وكلمة المرور.', 'Please enter email and password.'));
      return;
    }

    try {
      setLoading(true);
      setError('');
      await signIn(email, password);
      onSuccess();
    } catch {
      setError(t('تعذر تسجيل الدخول. تحقق من البيانات.', 'Login failed. Please check credentials.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="space-y-5 rounded-3xl bg-surface/95 p-5 shadow-elevate backdrop-blur-sm">
      <h2 className="font-heading text-2xl font-semibold tracking-tight">{t('تسجيل دخول الإدارة', 'Admin Login')}</h2>
      <form className="space-y-4" onSubmit={submit}>
        <FloatingField label={t('البريد الإلكتروني', 'Email')}>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder=" " className="pt-6" aria-label={t('البريد الإلكتروني', 'Email')} />
        </FloatingField>
        <FloatingField label={t('كلمة المرور', 'Password')}>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder=" " className="pt-6" aria-label={t('كلمة المرور', 'Password')} />
        </FloatingField>
        {error ? <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}
        <Button className="w-full" disabled={loading} type="submit">
          {loading ? t('جارٍ الدخول...', 'Signing in...') : t('دخول', 'Sign in')}
        </Button>
      </form>
    </Card>
  );
}
