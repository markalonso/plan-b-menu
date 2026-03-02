import { useEffect, useMemo, useRef, useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import LanguageToggle from '../components/LanguageToggle';
import Skeleton from '../components/Skeleton';
import CategoryTabs from '../components/menu/CategoryTabs';
import ItemSheet from '../components/menu/ItemSheet';
import MenuCard from '../components/menu/MenuCard';
import BillSheet from '../components/bill/BillSheet';
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
      <div className="rounded-[28px] bg-[rgba(255,255,255,0.62)] p-3 shadow-soft backdrop-blur-sm md:p-5">
      <header className="sticky top-0 z-30 rounded-3xl border border-border/40 bg-[rgba(246,242,237,0.88)] px-4 pb-3 pt-4 shadow-soft backdrop-blur-md md:px-5 [transform:translateZ(0)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          {loading ? <Skeleton className="h-8 w-44" /> : <h1 className="font-heading text-3xl font-semibold leading-tight tracking-tight">{restaurantName}</h1>}
          <LanguageToggle />
        </div>

        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 start-4 inline-flex items-center text-muted">⌕</span>
          <Input
            ref={searchRef}
            value={query}
            onFocus={() => searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('ابحث في القائمة', 'Search menu')}
            className="ps-10 pe-10"
            aria-label={t('بحث', 'Search')}
          />
          {query ? (
            <button className="absolute inset-y-0 end-3 min-h-11 min-w-11 rounded-full px-2 text-muted transition hover:bg-surface2" onClick={() => setQuery('')} aria-label={t('مسح البحث', 'Clear search')}>
              ✕
            </button>
          ) : null}
        </div>
      </header>

      <div className="sticky top-[126px] z-20 mb-4 rounded-2xl bg-[rgba(246,242,237,0.94)] px-2 py-2 backdrop-blur-md md:top-[134px] md:px-3">
        {loading ? (
          <div className="flex gap-2">
            <Skeleton className="h-11 w-20 rounded-full" />
            <Skeleton className="h-11 w-24 rounded-full" />
            <Skeleton className="h-11 w-24 rounded-full" />
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

      {error ? (
        <Card className="space-y-3 p-5 text-center">
          <p className="text-sm text-muted">{error}</p>
          <Button onClick={() => void loadData()}>{t('إعادة المحاولة', 'Retry')}</Button>
        </Card>
      ) : loading ? (
        <section className="space-y-3 md:space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="h-24 w-24 shrink-0 rounded-2xl" />
              <div className="w-full space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </Card>
          ))}
        </section>
      ) : categories.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-sm text-muted">{t('لا توجد فئات بعد. يمكن للمشرف إضافتها.', 'No categories yet. Admin can add categories.')}</p>
        </Card>
      ) : visibleItems.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-sm text-muted">{debouncedQuery ? t('لا توجد نتائج مطابقة.', 'No matching items.') : t('لا توجد أصناف في هذه الفئة حالياً.', 'No items in this category yet.')}</p>
        </Card>
      ) : (
        <section className="space-y-3 md:space-y-4">
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

      <button
        onClick={() => setBillOpen(true)}
        className="fixed end-4 z-40 inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-5 py-2 font-semibold text-accentText shadow-elevate transition-all duration-calm ease-calm"
        style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        aria-label={t('فتح الحساب', 'Open bill')}
      >
        <span>{t('الحساب', 'Bill')}</span>
        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-white/20 px-2 text-sm">{billItemCount}</span>
      </button>

      <BillSheet open={billOpen} onClose={() => setBillOpen(false)} language={language} t={t} currency={currency} formatPrice={formatPrice} />
      </div>
    </main>
  );
}
