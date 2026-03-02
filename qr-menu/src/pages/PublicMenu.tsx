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
    <main className="[content-visibility:auto]">
      {/* ─── Identity Space ─── */}
      <header className="mb-8 lg:mb-12">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-muted/70">{t('قائمة الطعام', 'Menu')}</p>
            {loading ? (
              <Skeleton className="h-10 w-52" />
            ) : (
              <h1 className="font-heading text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">{restaurantName}</h1>
            )}
          </div>
          <LanguageToggle />
        </div>

        {/* Thin rule under identity */}
        <div className="mt-6 h-px bg-[var(--divider)]" aria-hidden="true" />
      </header>

      {/* ─── Search ─── */}
      <div className="mb-8 relative">
        <span className="pointer-events-none absolute inset-y-0 start-4 inline-flex items-center text-muted/60">⌕</span>
        <Input
          ref={searchRef}
          value={query}
          onFocus={() => searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('ابحث في القائمة', 'Search the menu')}
          className="ps-10 pe-10 bg-white/70 backdrop-blur-sm border-[var(--divider)]"
          aria-label={t('بحث', 'Search')}
        />
        {query ? (
          <button
            className="absolute inset-y-0 end-3 min-h-11 min-w-11 rounded-full px-2 text-muted/60 transition hover:text-text"
            onClick={() => setQuery('')}
            aria-label={t('مسح البحث', 'Clear search')}
          >
            ✕
          </button>
        ) : null}
      </div>

      {/* ─── Category Navigation — spatial section, not tabs glued to top ─── */}
      <div className="mb-8">
        {loading ? (
          <div className="flex gap-3">
            <Skeleton className="h-9 w-16 rounded-full" />
            <Skeleton className="h-9 w-20 rounded-full" />
            <Skeleton className="h-9 w-20 rounded-full" />
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

      {/* ─── Menu Items — calm editorial grid ─── */}
      {error ? (
        <div className="py-12 text-center space-y-4">
          <p className="text-sm text-muted">{error}</p>
          <Button onClick={() => void loadData()}>{t('إعادة المحاولة', 'Retry')}</Button>
        </div>
      ) : loading ? (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden p-0">
              <Skeleton className="h-44 w-full rounded-none rounded-t-2xl" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </Card>
          ))}
        </section>
      ) : categories.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-muted">{t('لا توجد فئات بعد. يمكن للمشرف إضافتها.', 'No categories yet. Admin can add categories.')}</p>
        </div>
      ) : visibleItems.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-muted">{debouncedQuery ? t('لا توجد نتائج مطابقة.', 'No matching items.') : t('لا توجد أصناف في هذه الفئة حالياً.', 'No items in this category yet.')}</p>
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

      {/* ─── Bill Trigger — refined floating action ─── */}
      <button
        onClick={() => setBillOpen(true)}
        className="fixed end-5 z-40 inline-flex min-h-12 items-center gap-2.5 rounded-full bg-[var(--text)] px-5 py-2.5 font-medium text-[var(--bg)] shadow-[var(--shadow-md)] transition-all duration-300 ease-out hover:opacity-90 active:scale-95"
        style={{ bottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
        aria-label={t('فتح الحساب', 'Open bill')}
      >
        <span className="text-sm">{t('الحساب', 'Bill')}</span>
        {billItemCount > 0 && (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--bg)]/20 px-1.5 text-xs font-semibold">
            {billItemCount}
          </span>
        )}
      </button>

      <BillSheet open={billOpen} onClose={() => setBillOpen(false)} language={language} t={t} currency={currency} formatPrice={formatPrice} />
    </main>
  );
}
