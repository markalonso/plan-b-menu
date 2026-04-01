import { useEffect, useMemo, useRef, useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import LanguageToggle from '../components/LanguageToggle';
import BillSheet from '../components/bill/BillSheet';
import BillPill from '../components/bill/BillPill';
import CategoryTabs from '../components/menu/CategoryTabs';
import ItemSheet from '../components/menu/ItemSheet';
import MenuCard from '../components/menu/MenuCard';
import planBMark from '../assets/logo-planb.png.png';
import { getCategories, getItems, getSettings, type Category, type MenuItem, type Settings } from '../lib/api/menu';
import { billActions, getItemCount, getTotal, useBillStore } from '../lib/bill/store';
import { useLanguage } from '../lib/language';
import { filterMenuItems } from '../lib/menu/filter';

const ALL_KEY = '__all__';
const MAX_VISIBLE_CATEGORY_CHIPS = 10;
const SPLASH_MIN_MS = 220;
const LOAD_TIMEOUT_MS = 12_000;

let cache: { settings: Settings | null; categories: Category[]; items: MenuItem[] } | null = null;

function BrandMark({ className = '' }: { className?: string }) {
  return <img src={planBMark} alt="" className={className} loading="eager" decoding="async" />;
}

function isIOSWebKitBrowser() {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  const iOSDevice = /iP(hone|od|ad)/.test(ua) || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
  const webkitEngine = /WebKit/i.test(ua);
  return iOSDevice && webkitEngine;
}

function MenuSplash({ restaurantName, isIOSWebKit }: { restaurantName: string; isIOSWebKit: boolean }) {
  return (
    <section className={`entry-shell entry-splash ${isIOSWebKit ? 'ios-webkit' : ''}`} aria-label={restaurantName}>
      <div className="entry-card">
        <BrandMark className="mx-auto h-20 w-20 drop-shadow-[0_12px_25px_rgba(13,58,146,0.2)]" />
        <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-text">{restaurantName}</h1>
      </div>
    </section>
  );
}

function BrandedLoading({ restaurantName, loadingText, isIOSWebKit }: { restaurantName: string; loadingText: string; isIOSWebKit: boolean }) {
  return (
    <section className={`entry-shell entry-loading ${isIOSWebKit ? 'ios-webkit' : ''}`} aria-live="polite" aria-busy="true">
      <div className="entry-card">
        <BrandMark className="mx-auto h-16 w-16 opacity-95" />
        <p className="mt-4 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-muted/70">Plan B Menu</p>
        <h2 className="mt-1 font-heading text-2xl font-semibold tracking-tight text-text">{restaurantName}</h2>
        <p className="mt-2 text-sm text-muted">{loadingText}</p>
        <div className="mt-5 flex items-center justify-center">
          <span className="loading-dots" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

function formatPrice(price: number, currency: string, language: 'ar' | 'en') {
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(price);
}


function getMenuPriceText(item: MenuItem, currency: string, language: 'ar' | 'en') {
  if (item.price_text && item.price_text.trim()) {
    return `${item.price_text} ${currency}`;
  }

  return formatPrice(item.price, currency, language);
}

export default function PublicMenu() {
  const { language, t } = useLanguage();
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [settings, setSettings] = useState<Settings | null>(cache?.settings ?? null);
  const [categories, setCategories] = useState<Category[]>(cache?.categories ?? []);
  const [items, setItems] = useState<MenuItem[]>(cache?.items ?? []);
  const [selectedCategory, setSelectedCategory] = useState(ALL_KEY);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [billOpen, setBillOpen] = useState(false);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState('');
  const [splashReadyToExit, setSplashReadyToExit] = useState(false);
  const [entryPhase, setEntryPhase] = useState<'splash' | 'loading' | 'menu'>(cache ? 'menu' : 'splash');
  const [isIOSWebKit] = useState(() => isIOSWebKitBrowser());
  const billState = useBillStore();
  const mountedRef = useRef(true);

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQuery(query), 200);
    return () => window.clearTimeout(id);
  }, [query]);

  async function loadData() {
    let timeoutId: number | undefined;

    try {
      setLoading(true);
      setError('');

      const request = Promise.all([getSettings().catch(() => null), getCategories(), getItems()]);
      const timeout = new Promise<never>((_, reject) => {
        timeoutId = window.setTimeout(() => reject(new Error('menu-load-timeout')), LOAD_TIMEOUT_MS);
      });

      const [settingsData, categoriesData, itemsData] = await Promise.race([request, timeout]);

      const orderedCategories = [...categoriesData]
        .filter((c) => c.is_active !== false)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

      const orderedItems = [...itemsData]
        .filter((i) => i.is_available !== false)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

      cache = {
        settings: settingsData,
        categories: orderedCategories,
        items: orderedItems
      };

      if (!mountedRef.current) return;
      setSettings(settingsData);
      setCategories(orderedCategories);
      setItems(orderedItems);
    } catch {
      if (!mountedRef.current) return;
      setError(t('حدث خطأ أثناء تحميل القائمة.', 'Failed to load the menu.'));
    } finally {
      if (typeof timeoutId === 'number') {
        window.clearTimeout(timeoutId);
      }

      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (cache) return;
    void loadData();
  }, []);

  useEffect(() => {
    if (cache) {
      setSplashReadyToExit(true);
      return;
    }

    const id = window.setTimeout(() => setSplashReadyToExit(true), SPLASH_MIN_MS);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!splashReadyToExit) {
      setEntryPhase('splash');
      return;
    }

    setEntryPhase(loading ? 'loading' : 'menu');
  }, [splashReadyToExit, loading]);

  useEffect(() => {
    if (entryPhase !== 'loading') return;

    const id = window.setTimeout(() => {
      if (!mountedRef.current) return;
      setError(t('تعذر إكمال التحميل. حاول مرة أخرى.', 'Loading took too long. Please retry.'));
      setLoading(false);
    }, LOAD_TIMEOUT_MS + SPLASH_MIN_MS);

    return () => window.clearTimeout(id);
  }, [entryPhase, t]);

  const tabs = useMemo(
    () => [
      { id: ALL_KEY, label: t('الكل', 'All') },
      ...categories.map((category) => ({
        id: category.id ?? category.slug,
        label: language === 'ar' ? category.name_ar : category.name_en
      }))
    ],
    [categories, language, t]
  );

  const visibleItems = useMemo(
    () => filterMenuItems({ items, categoryId: selectedCategory, search: debouncedQuery, language }),
    [items, selectedCategory, debouncedQuery, language]
  );

  const restaurantName = settings ? (language === 'ar' ? settings.restaurant_name_ar : settings.restaurant_name_en) : t('بلان بي', 'Plan B');
  const currency = settings?.currency ?? 'EGP';
  const vatNote = language === 'ar' ? settings?.vat_note_ar : settings?.vat_note_en;

  function addToBill(item: MenuItem, quantity: number) {
    const fallbackId = `${item.name_en}-${item.price}`;
    billActions.addItem({
      id: item.id ?? fallbackId,
      name_ar: item.name_ar,
      name_en: item.name_en,
      price: item.price
    }, quantity);
    setSelectedItem(null);
  }

  function scrollToMenuTop() {
    if (typeof window === 'undefined') return;
    if (window.scrollY < 80) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  const billItemCount = getItemCount(billState);
  const billTotal = getTotal(billState);
  const billSummary = formatPrice(billTotal, currency, language);

  if (entryPhase === 'splash') {
    return <MenuSplash restaurantName={restaurantName} isIOSWebKit={isIOSWebKit} />;
  }

  if (entryPhase === 'loading') {
    return <BrandedLoading restaurantName={restaurantName} loadingText={t('نجهز قائمتك الآن', 'Preparing your menu')} isIOSWebKit={isIOSWebKit} />;
  }

  return (
    <main className={`${isIOSWebKit ? 'ios-webkit' : ''} menu-welcome-enter ${billItemCount > 0 ? 'pb-28' : 'pb-6'}`}>
      <div className={`menu-sticky-shell rounded-[30px] p-3 shadow-soft md:p-4 ${isIOSWebKit ? 'menu-sticky-shell-ios' : 'backdrop-blur-sm'}`}>
        {/* Sticky header */}
        <header className={`menu-sticky-header sticky top-0 z-30 rounded-2xl px-4 pb-3 pt-4 md:px-5 [transform:translateZ(0)] ${isIOSWebKit ? 'menu-sticky-header-ios' : 'backdrop-blur-lg'}`}>
          <div className="menu-hero mb-4 rounded-2xl border border-border/60 bg-bg/70 p-3">
            <div className="flex items-center gap-2.5">
              <BrandMark className="h-8 w-8 shrink-0" />
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted/70">Plan B Menu</p>
                <p className="text-sm leading-tight text-muted">{t('اختيارات اليوم بلمسة هادئة', 'Today’s picks, presented with calm')}</p>
              </div>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted/70">Plan B Menu</p>
              <h1 className="mt-0.5 font-heading text-3xl font-semibold leading-tight tracking-tight md:text-4xl">{restaurantName}</h1>
            </div>
            <LanguageToggle />
          </div>

          {/* Search */}
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 start-4 inline-flex items-center text-muted/60 text-base" aria-hidden="true">⌕</span>
            <Input
              ref={searchRef}
              value={query}
              onFocus={() => searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('ابحث في القائمة', 'Search menu…')}
              className="h-11 rounded-xl border-inputBorder bg-inputBg ps-10 pe-10 shadow-soft hover:border-inputBorderHover focus:border-inputBorderFocus"
              aria-label={t('بحث', 'Search')}
            />
            {query ? (
              <button
                className="absolute inset-y-0 end-3 inline-flex min-h-9 min-w-9 items-center justify-center rounded-full text-sm text-muted transition-all duration-200 hover:bg-interactiveSoft active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary-focus-ring)] motion-reduce:transition-none motion-reduce:transform-none"
                onClick={() => setQuery('')}
                aria-label={t('مسح البحث', 'Clear search')}
              >
                ✕
              </button>
            ) : null}
          </div>
        </header>

        {/* Category tabs */}
        <div className="mt-3 mb-4">
          <CategoryTabs
            tabs={tabs}
            active={selectedCategory}
            maxVisibleTabs={MAX_VISIBLE_CATEGORY_CHIPS}
            moreLabel={t('المزيد', 'More')}
            allCategoriesTitle={t('كل الفئات', 'All categories')}
            onChange={(id) => {
              setSelectedCategory(id);
              scrollToMenuTop();
            }}
          />
        </div>

        {/* Content */}
        {error ? (
          <Card className="space-y-3 p-5 text-center">
            <p className="text-sm text-muted">{error}</p>
            <Button onClick={() => void loadData()}>{t('إعادة المحاولة', 'Retry')}</Button>
          </Card>
        ) : categories.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-sm text-muted">{t('لا توجد فئات بعد. يمكن للمشرف إضافتها.', 'No categories yet. Admin can add categories.')}</p>
          </Card>
        ) : visibleItems.length === 0 ? (
          <Card className="space-y-3 p-6 text-center">
            {debouncedQuery ? (
              <>
                <p className="text-base font-medium text-text">{t('لا توجد نتائج مطابقة للبحث.', 'No matching items found.')}</p>
                <p className="text-sm text-muted">{t('جرّب كلمة أخرى أو امسح البحث للعودة إلى القائمة.', 'Try another keyword or clear search to browse the menu.')}</p>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <Button variant="secondary" className="sm:min-w-40" onClick={() => setQuery('')}>
                    {t('مسح البحث', 'Clear search')}
                  </Button>
                  {selectedCategory !== ALL_KEY ? (
                    <Button variant="ghost" className="sm:min-w-40" onClick={() => setSelectedCategory(ALL_KEY)}>
                      {t('عرض كل الفئات', 'Show all categories')}
                    </Button>
                  ) : null}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted">{t('لا توجد أصناف في هذه الفئة حالياً.', 'No items in this category yet.')}</p>
            )}
          </Card>
        ) : (
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {visibleItems.map((item) => {
              const name = language === 'ar' ? item.name_ar : item.name_en;
              const rawDescription = language === 'ar' ? item.desc_ar : item.desc_en;
              const description = rawDescription?.trim() ? rawDescription.trim() : undefined;

              return (
                <MenuCard
                  key={item.id ?? `${item.name_en}-${item.price}`}
                  item={item}
                  name={name}
                  description={description}
                  priceText={getMenuPriceText(item, currency, language)}
                  onClick={() => setSelectedItem(item)}
                />
              );
            })}
          </section>
        )}

        <ItemSheet
          open={Boolean(selectedItem)}
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAdd={addToBill}
          language={language}
          t={t}
          currency={currency}
          getMenuPriceText={getMenuPriceText}
        />

        <BillSheet open={billOpen} onClose={() => setBillOpen(false)} language={language} t={t} currency={currency} formatPrice={formatPrice} vatNote={vatNote} />
      </div>

      <BillPill
        count={billItemCount}
        summary={billSummary}
        onOpen={() => setBillOpen(true)}
        label={t('الحساب', 'Bill')}
        ariaLabel={t('فتح الحساب', 'Open bill')}
      />
    </main>
  );
}
