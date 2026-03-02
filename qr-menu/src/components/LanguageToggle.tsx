import { useLanguage } from '../lib/language';
import { cn } from '../lib/utils';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex rounded-full bg-[rgba(255,255,255,0.78)] p-1 shadow-soft backdrop-blur-sm">
      <button
        type="button"
        className={cn(
          'min-h-11 min-w-16 rounded-full px-4 text-sm font-semibold transition-all duration-calm ease-calm',
          language === 'ar' ? 'bg-accent text-accentText shadow-soft' : 'text-text hover:bg-surface2'
        )}
        onClick={() => setLanguage('ar')}
      >
        AR
      </button>
      <button
        type="button"
        className={cn(
          'min-h-11 min-w-16 rounded-full px-4 text-sm font-semibold transition-all duration-calm ease-calm',
          language === 'en' ? 'bg-accent text-accentText shadow-soft' : 'text-text hover:bg-surface2'
        )}
        onClick={() => setLanguage('en')}
      >
        EN
      </button>
    </div>
  );
}
