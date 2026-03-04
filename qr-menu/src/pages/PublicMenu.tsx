import { useEffect, useMemo, useRef, useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import LanguageToggle from '../components/LanguageToggle';
import Skeleton from '../components/Skeleton';
import BillSheet from '../components/bill/BillSheet';
import CategoryTabs from '../components/menu/CategoryTabs';
import ItemSheet from '../components/menu/ItemSheet';
import MenuCard from '../components/menu/MenuCard';
import { getCategories, getItems, getSettings, type Category, type MenuItem, type Settings } from '../lib/api/menu';
import { billActions, getItemCount, useBillStore } from '../lib/bill/store';
import { useLanguage } from '../lib/language';
import { filterMenuItems } from '../lib/menu/filter';

const ALL_KEY = '__all__';

let cache: { settings: Settings | null; categories: Category[]; items: MenuItem[] } | null = null;

function formatPrice(price: number, currency: string, language: 'ar' | 'en') {
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(price);
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
  const billState = useBillStore();

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQuery(query), 200);
    return () => window.clearTimeout(id);
  }, [query]);

  async function loadData() {
    try {
      setLoading(true);
      setError('');

      const [settingsData, categoriesData, itemsData] = await Promise.all([getSettings().catch(() => null), getCategories(), getItems()]);

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

      setSettings(settingsData);
      setCategories(orderedCategories);
      setItems(orderedItems);
    } catch {
      setError(t('حدث خطأ أثناء تحميل القائمة.', 'Failed to load the menu.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (cache) return;
    void loadData();
  }, []);

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

  function addToBill(item: MenuItem) {
    const fallbackId = `${item.name_en}-${item.price}`;
    billActions.addItem({
      id: item.id ?? fallbackId,
      name_ar: item.name_ar,
      name_en: item.name_en,
      price: item.price
    });
    setSelectedItem(null);
  }

  const billItemCount = getItemCount(billState);

  return (
    <main className="pb-28 [content-visibility:auto]">
      <div className="rounded-[30px] bg-surface/60 p-3 shadow-soft backdrop-blur-sm md:p-5">
        {/* Sticky header */}
        <header className="sticky top-0 z-30 rounded-2xl border border-border/30 bg-bg/90 px-4 pb-3 pt-4 shadow-soft backdrop-blur-md md:px-5 [transform:translateZ(0)]">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted/70">Plan B Menu</p>
              {loading ? (
                <Skeleton className="mt-1.5 h-8 w-48" />
              ) : (
                <h1 className="mt-0.5 font-heading text-3xl font-semibold leading-tight tracking-tight md:text-4xl">{restaurantName}</h1>
              )}
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
                className="absolute inset-y-0 end-3 inline-flex min-h-9 min-w-9 items-center justify-center rounded-full text-sm text-muted transition hover:bg-interactiveSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary-focus-ring)]"
                onClick={() => setQuery('')}
                aria-label={t('مسح البحث', 'Clear search')}
              >
                ✕
              </button>
            ) : null}
          </div>
        </header>

        {/* Category tabs */}
        <div className="sticky top-[132px] z-20 mt-3 mb-5 md:top-[144px]">
          {loading ? (
            <div className="flex gap-1.5 rounded-2xl border border-border/60 bg-tabbar p-1.5 shadow-soft">
              <Skeleton className="h-10 w-16 rounded-full" />
              <Skeleton className="h-10 w-20 rounded-full" />
              <Skeleton className="h-10 w-20 rounded-full" />
            </div>
          ) : (
            <CategoryTabs
              tabs={tabs}
              active={selectedCategory}
              onChange={(id) => {
                setSelectedCategory(id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}
        </div>

        {/* Content */}
        {error ? (
          <Card className="space-y-3 p-5 text-center">
            <p className="text-sm text-muted">{error}</p>
            <Button onClick={() => void loadData()}>{t('إعادة المحاولة', 'Retry')}</Button>
          </Card>
        ) : loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-[26px] bg-surface shadow-soft">
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="space-y-2 p-4">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-sm text-muted">{t('لا توجد فئات بعد. يمكن للمشرف إضافتها.', 'No categories yet. Admin can add categories.')}</p>
          </Card>
        ) : visibleItems.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-sm text-muted">{debouncedQuery ? t('لا توجد نتائج مطابقة.', 'No matching items.') : t('لا توجد أصناف في هذه الفئة حالياً.', 'No items in this category yet.')}</p>
          </Card>
        ) : (
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
            {visibleItems.map((item) => {
              const name = language === 'ar' ? item.name_ar : item.name_en;
              const description = (language === 'ar' ? item.desc_ar : item.desc_en) || t('وصف مختصر للطبق.', 'A short dish description.');

              return (
                <MenuCard
                  key={item.id ?? `${item.name_en}-${item.price}`}
                  item={item}
                  name={name}
                  description={description}
                  priceText={formatPrice(item.price, currency, language)}
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
          formatPrice={formatPrice}
        />

        <BillSheet open={billOpen} onClose={() => setBillOpen(false)} language={language} t={t} currency={currency} formatPrice={formatPrice} />
      </div>

      {/* Bill FAB — must live OUTSIDE any backdrop-filter ancestor.
          WebKit/iOS treats backdrop-filter as a containing block,
          which breaks position:fixed on children. */}
      <button
        onClick={() => setBillOpen(true)}
        className="fixed end-4 z-40 inline-flex min-h-12 items-center gap-2.5 rounded-full bg-primary px-5 py-2.5 font-semibold text-primaryText shadow-elevate transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-primaryHover active:scale-[0.97] active:bg-primaryActive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary-focus-ring)] focus-visible:ring-offset-2"
        style={{ bottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
        aria-label={t('فتح الحساب', 'Open bill')}
      >
        <span>{t('الحساب', 'Bill')}</span>
        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-white/25 px-2 text-sm font-bold">{billItemCount}</span>
      </button>
    </main>
  );
}
