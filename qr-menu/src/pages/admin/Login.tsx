import { FormEvent, useState } from 'react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import { signIn } from '../../lib/auth';
import { useLanguage } from '../../lib/language';

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
    <Card className="space-y-4 p-4">
      <h2 className="text-xl font-bold">{t('تسجيل دخول الإدارة', 'Admin Login')}</h2>
      <form className="space-y-3" onSubmit={submit}>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('البريد الإلكتروني', 'Email')} aria-label={t('البريد الإلكتروني', 'Email')} />
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('كلمة المرور', 'Password')} aria-label={t('كلمة المرور', 'Password')} />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button className="w-full" disabled={loading} type="submit">
          {loading ? t('جارٍ الدخول...', 'Signing in...') : t('دخول', 'Sign in')}
        </Button>
      </form>
    </Card>
  );
}
