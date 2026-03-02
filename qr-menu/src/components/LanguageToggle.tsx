import { useLanguage } from '../lib/language';
import { cn } from '../lib/utils';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex rounded-full border border-border bg-surface p-1 shadow-soft">
      <button
        type="button"
        className={cn(
          'min-h-11 min-w-16 rounded-full px-4 text-sm font-semibold transition-all duration-calm ease-calm',
          language === 'ar' ? 'bg-accent text-accentText' : 'text-text hover:bg-surface2'
        )}
        onClick={() => setLanguage('ar')}
      >
        AR
      </button>
      <button
        type="button"
        className={cn(
          'min-h-11 min-w-16 rounded-full px-4 text-sm font-semibold transition-all duration-calm ease-calm',
          language === 'en' ? 'bg-accent text-accentText' : 'text-text hover:bg-surface2'
        )}
        onClick={() => setLanguage('en')}
      >
        EN
      </button>
    </div>
  );
}
