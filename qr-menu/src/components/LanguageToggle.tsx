import { useLanguage } from '../lib/language';
import { cn } from '../lib/utils';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex rounded-full bg-[rgba(255,255,255,0.78)] p-0.5 shadow-soft backdrop-blur-sm">
      <button
        type="button"
        className={cn(
          'min-h-10 min-w-14 rounded-full px-3.5 text-[0.82rem] font-semibold transition-all duration-calm ease-calm',
          language === 'ar' ? 'bg-accent text-accentText shadow-soft' : 'text-text hover:bg-surface2'
        )}
        onClick={() => setLanguage('ar')}
      >
        AR
      </button>
      <button
        type="button"
        className={cn(
          'min-h-10 min-w-14 rounded-full px-3.5 text-[0.82rem] font-semibold transition-all duration-calm ease-calm',
          language === 'en' ? 'bg-accent text-accentText shadow-soft' : 'text-text hover:bg-surface2'
        )}
        onClick={() => setLanguage('en')}
      >
        EN
      </button>
    </div>
  );
}
