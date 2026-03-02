import { useEffect, useMemo, useState } from 'react';
import BottomSheet from '../components/BottomSheet';
import Button from '../components/Button';
import Card from '../components/Card';
import Chip from '../components/Chip';
import Input from '../components/Input';
import LanguageToggle from '../components/LanguageToggle';
import Skeleton from '../components/Skeleton';
import { buildPersonSummaries, getDiscountAmount, getSubtotal, getTaxAmount, getTotal } from '../lib/bill/calculations';
import { useBill } from '../lib/bill/useBill';
import { getCategories, getItems, getSettings, type Category, type MenuItem, type Settings } from '../lib/api/menu';
import { useLanguage } from '../lib/language';

const ALL_KEY = '__all__';

let cachedData: { settings: Settings; categories: Category[]; items: MenuItem[] } | null = null;

function formatPrice(price: number, currency: string, language: 'ar' | 'en') {
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(price);
}

function getItemName(item: MenuItem, language: 'ar' | 'en') {
  return language === 'ar' ? item.name_ar : item.name_en;
}

function getItemDesc(item: MenuItem, language: 'ar' | 'en') {
  return language === 'ar' ? item.desc_ar ?? '' : item.desc_en ?? '';
}

export default function PublicMenu() {
  const { language, t } = useLanguage();
  const [settings, setSettings] = useState<Settings | null>(cachedData?.settings ?? null);
  const [categories, setCategories] = useState<Category[]>(cachedData?.categories ?? []);
  const [items, setItems] = useState<MenuItem[]>(cachedData?.items ?? []);
  const [loading, setLoading] = useState(!cachedData);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(ALL_KEY);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [billOpen, setBillOpen] = useState(false);
  const [splitMode, setSplitMode] = useState<'equal' | 'smart'>('equal');
  const [activePerson, setActivePerson] = useState(0);

  const { state: bill, setState: setBill, addItem, changeQty, removeItem, assignQty, setPeopleCount, resetBill, itemCount } = useBill();

  useEffect(() => {
    if (cachedData) return;

    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        const [settingsData, categoriesData, itemsData] = await Promise.all([getSettings(), getCategories(), getItems()]);

        if (!mounted) return;

        cachedData = {
          settings: settingsData,
          categories: categoriesData,
          items: itemsData
        };

        setSettings(settingsData);
        setCategories(categoriesData);
        setItems(itemsData);
      } catch {
        if (mounted) {
          setError(t('تعذر تحميل القائمة حالياً.', 'Unable to load the menu right now.'));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [t]);

  const categoryOptions = useMemo(
    () => [{ id: ALL_KEY, label: t('الكل', 'All') }, ...categories.map((category) => ({ id: category.id ?? category.slug, label: language === 'ar' ? category.name_ar : category.name_en }))],
    [categories, language, t]
  );

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return items.filter((item) => {
      const categoryMatch =
        activeCategory === ALL_KEY ||
        item.category_id === activeCategory ||
        categories.find((category) => (category.id ?? category.slug) === activeCategory)?.id === item.category_id;

      if (!categoryMatch) return false;
      if (!normalizedSearch) return true;

      const haystack = [item.name_ar, item.name_en, item.desc_ar ?? '', item.desc_en ?? ''].join(' ').toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [activeCategory, categories, items, search]);

  const currency = settings?.currency || 'EGP';
  const restaurantName = settings ? (language === 'ar' ? settings.restaurant_name_ar : settings.restaurant_name_en) : t('بلان بي', 'Plan B');

  const subtotal = getSubtotal(bill);
  const taxAmount = getTaxAmount(bill, subtotal);
  const discountAmount = getDiscountAmount(bill, subtotal);
  const total = getTotal(bill);
  const peopleCount = Math.max(1, bill.peopleCount);
  const equalPerPerson = total / peopleCount;
  const personSummaries = buildPersonSummaries(bill);

  return (
    <main className="pb-24 [content-visibility:auto]">
      <header className="sticky top-0 z-30 -mx-4 mb-3 border-b border-border/80 bg-bg/90 px-4 pb-3 pt-4 backdrop-blur-sm [transform:translateZ(0)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight" aria-label={t('اسم المطعم', 'Restaurant name')}>{restaurantName}</h1>
          <LanguageToggle />
        </div>

        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 start-4 inline-flex items-center text-muted">⌕</span>
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('ابحث في القائمة', 'Search menu')} className="ps-10" aria-label={t('بحث', 'Search')} />
        </div>
      </header>

      <div className="sticky top-[116px] z-20 -mx-4 mb-4 border-b border-border/60 bg-bg/90 px-4 py-2 backdrop-blur-sm [transform:translateZ(0)]">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {categoryOptions.map((category) => (
            <Chip key={category.id} active={activeCategory === category.id} onClick={() => setActiveCategory(category.id)}>
              {category.label}
            </Chip>
          ))}
        </div>
      </div>

      {!loading && !error && categories.length === 0 ? (
        <Card className="mb-3">
          <p className="text-sm text-muted">{t('لا توجد فئات مفعلة حالياً. يمكنك إضافتها من لوحة الإدارة.', 'No active categories yet. You can add them from the admin panel.')}</p>
        </Card>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="flex items-center gap-3 p-3">
              <Skeleton className="h-24 w-24 shrink-0 rounded-2xl" />
              <div className="w-full space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <p className="text-base text-muted">{error}</p>
        </Card>
      ) : filteredItems.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-base font-medium text-text">{t('لا توجد نتائج مطابقة.', 'No matching items found.')}</p>
          <p className="mt-1 text-sm text-muted">{t('جرّب كلمة بحث أخرى أو اختر فئة مختلفة.', 'Try another search term or a different category.')}</p>
        </Card>
      ) : (
        <section className="space-y-3">
          {filteredItems.map((item) => (
            <button key={item.id ?? `${item.name_ar}-${item.price}`} className="block w-full text-start transition-transform duration-calm ease-calm active:scale-[0.995]" onClick={() => setSelectedItem(item)} aria-label={`${getItemName(item, language)} ${t('عرض التفاصيل', 'view details')}`}>
              <Card className="p-3">
                <div className="flex items-center gap-3">
                  {item.image_url ? (
                    <img src={item.image_url} alt={getItemName(item, language)} loading="lazy" decoding="async" className="h-24 w-24 shrink-0 rounded-2xl border border-border object-cover" />
                  ) : (
                    <div className="h-24 w-24 shrink-0 rounded-2xl border border-border bg-gradient-to-br from-surface2 to-surface" aria-hidden="true" />
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold leading-tight text-text">{getItemName(item, language)}</h3>
                    <p className="mt-1 text-sm text-muted" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {getItemDesc(item, language) || t('وصف مختصر للطبق.', 'A short dish description.')}
                    </p>
                    <p className="mt-2 text-base font-bold text-accent">{formatPrice(item.price, currency, language)}</p>
                  </div>
                </div>
              </Card>
            </button>
          ))}
        </section>
      )}

      <BottomSheet open={Boolean(selectedItem)} onClose={() => setSelectedItem(null)} title={selectedItem ? getItemName(selectedItem, language) : ''}>
        {selectedItem ? (
          <div className="space-y-4">
            {selectedItem.image_url ? (
              <img src={selectedItem.image_url} alt={getItemName(selectedItem, language)} loading="lazy" decoding="async" className="h-52 w-full rounded-3xl border border-border object-cover" />
            ) : (
              <div className="h-52 w-full rounded-3xl border border-border bg-gradient-to-br from-surface2 to-surface" />
            )}

            <p className="text-base text-muted">{getItemDesc(selectedItem, language) || t('لا يوجد وصف إضافي لهذا الصنف.', 'No extra description for this item.')}</p>

            {selectedItem.tags?.length ? (
              <div className="flex flex-wrap gap-2">
                {selectedItem.tags.map((tag) => (
                  <Chip key={tag}>{tag}</Chip>
                ))}
              </div>
            ) : null}

            <div className="rounded-2xl bg-surface2 px-4 py-3 text-lg font-bold text-accent">{formatPrice(selectedItem.price, currency, language)}</div>

            <div className="grid grid-cols-1 gap-2">
              <Button
                onClick={() => {
                  addItem({
                    id: selectedItem.id ?? `${selectedItem.name_en}-${selectedItem.price}`,
                    name_ar: selectedItem.name_ar,
                    name_en: selectedItem.name_en,
                    price: selectedItem.price
                  });
                  setSelectedItem(null);
                }}
              >
                {t('أضف للحساب', 'Add to bill')}
              </Button>
              <Button variant="secondary" onClick={() => setSelectedItem(null)}>
                {t('إغلاق', 'Close')}
              </Button>
            </div>
          </div>
        ) : null}
      </BottomSheet>

      <button className="fixed bottom-5 end-4 z-40 inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface px-4 shadow-elevate transition-transform duration-calm ease-calm active:scale-[0.98]" onClick={() => setBillOpen(true)} aria-label={t('فتح الحاسبة', 'Open bill calculator')}>
        <span className="font-semibold">{t('الحساب', 'Bill')}</span>
        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-accent px-2 text-xs font-bold text-accentText">{itemCount}</span>
      </button>

      <BottomSheet open={billOpen} onClose={() => setBillOpen(false)} title={t('حاسبة الحساب', 'Bill Calculator')}>
        <div className="space-y-4">
          {bill.cart.length === 0 ? (
            <p className="text-sm text-muted">{t('لا توجد أصناف في الحساب بعد.', 'No bill items yet.')}</p>
          ) : (
            <div className="space-y-2">
              {bill.cart.map((item) => (
                <Card key={item.id} className="space-y-2 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">{language === 'ar' ? item.name_ar : item.name_en}</p>
                      <p className="text-sm text-muted">{formatPrice(item.price, currency, language)}</p>
                    </div>
                    <Button variant="ghost" onClick={() => removeItem(item.id)}>
                      {t('إزالة', 'Remove')}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={() => changeQty(item.id, -1)}>
                      -
                    </Button>
                    <span className="min-w-8 text-center font-semibold">{item.quantity}</span>
                    <Button variant="secondary" onClick={() => changeQty(item.id, 1)}>
                      +
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <Card className="space-y-3 p-3">
            <div className="flex items-center justify-between">
              <p>{t('إضافة ضريبة', 'Add tax')}</p>
              <input type="checkbox" aria-label={t('تفعيل الضريبة', 'Enable tax')} checked={bill.taxEnabled} onChange={(e) => setBill((s) => ({ ...s, taxEnabled: e.target.checked }))} />
            </div>
            {bill.taxEnabled ? (
              <Input
                type="number"
                placeholder={t('نسبة الضريبة %', 'Tax %')}
                value={String(bill.taxRate)}
                onChange={(e) => setBill((s) => ({ ...s, taxRate: Number(e.target.value || 0) }))}
              />
            ) : null}

            <div className="flex items-center justify-between">
              <p>{t('خصم', 'Discount')}</p>
              <input type="checkbox" aria-label={t('تفعيل الخصم', 'Enable discount')} checked={bill.discountEnabled} onChange={(e) => setBill((s) => ({ ...s, discountEnabled: e.target.checked }))} />
            </div>
            {bill.discountEnabled ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant={bill.discountType === 'percent' ? 'primary' : 'secondary'} onClick={() => setBill((s) => ({ ...s, discountType: 'percent' }))}>
                    %
                  </Button>
                  <Button variant={bill.discountType === 'fixed' ? 'primary' : 'secondary'} onClick={() => setBill((s) => ({ ...s, discountType: 'fixed' }))}>
                    {t('قيمة', 'Fixed')}
                  </Button>
                </div>
                <Input
                  type="number"
                  value={String(bill.discountValue)}
                  placeholder={t('قيمة الخصم', 'Discount value')}
                  onChange={(e) => setBill((s) => ({ ...s, discountValue: Number(e.target.value || 0) }))}
                />
              </div>
            ) : null}

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>{t('المجموع الفرعي', 'Subtotal')}</span>
                <strong>{formatPrice(subtotal, currency, language)}</strong>
              </div>
              <div className="flex justify-between text-muted">
                <span>{t('الضريبة', 'Tax')}</span>
                <span>{formatPrice(taxAmount, currency, language)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>{t('الخصم', 'Discount')}</span>
                <span>- {formatPrice(discountAmount, currency, language)}</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="font-bold">{t('الإجمالي', 'Total')}</span>
                <span className="font-bold text-accent">{formatPrice(total, currency, language)}</span>
              </div>
            </div>
          </Card>

          <Card className="space-y-3 p-3">
            <div className="grid grid-cols-2 gap-2">
              <Button variant={splitMode === 'equal' ? 'primary' : 'secondary'} onClick={() => setSplitMode('equal')}>
                {t('تقسيم متساوٍ', 'Equal Split')}
              </Button>
              <Button variant={splitMode === 'smart' ? 'primary' : 'secondary'} onClick={() => setSplitMode('smart')}>
                {t('تقسيم ذكي', 'Smart Split')}
              </Button>
            </div>

            <Input type="number" value={String(peopleCount)} onChange={(e) => setPeopleCount(Number(e.target.value || 1))} placeholder={t('عدد الأشخاص', 'Number of people')} />

            {splitMode === 'equal' ? (
              <div className="rounded-2xl bg-surface2 px-4 py-3 text-sm">
                <p className="font-semibold">{t('لكل شخص', 'Per person')}</p>
                <p className="text-accent">{formatPrice(equalPerPerson, currency, language)}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                  {Array.from({ length: peopleCount }).map((_, idx) => (
                    <Button key={idx} variant={activePerson === idx ? 'primary' : 'secondary'} onClick={() => setActivePerson(idx)}>
                      {t('شخص', 'Person')} {idx + 1}
                    </Button>
                  ))}
                </div>

                <div className="space-y-2">
                  {bill.cart.map((item) => {
                    const row = bill.smartAssignments[item.id] ?? Array.from({ length: peopleCount }, () => 0);
                    const assigned = row.reduce((a, b) => a + b, 0);
                    const remaining = item.quantity - assigned;
                    const mine = row[activePerson] ?? 0;

                    return (
                      <div key={item.id} className="rounded-2xl border border-border bg-surface2 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-sm font-semibold">{language === 'ar' ? item.name_ar : item.name_en}</p>
                          <p className="text-xs text-muted">
                            {t('متبقي', 'Remaining')}: {remaining}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="secondary" onClick={() => assignQty(item.id, activePerson, -1)}>
                            -
                          </Button>
                          <span className="min-w-8 text-center font-semibold">{mine}</span>
                          <Button variant="secondary" onClick={() => assignQty(item.id, activePerson, 1)}>
                            +
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  {personSummaries.map((summary, idx) => (
                    <Card key={idx} className="p-3">
                      <p className="mb-1 font-semibold">
                        {t('شخص', 'Person')} {idx + 1}
                      </p>
                      <p className="text-sm text-muted">{t('المجموع الفرعي', 'Subtotal')}: {formatPrice(summary.subtotal, currency, language)}</p>
                      <p className="text-sm text-muted">{t('حصة الضريبة', 'Tax share')}: {formatPrice(summary.taxShare, currency, language)}</p>
                      <p className="text-sm text-muted">{t('حصة الخصم', 'Discount share')}: {formatPrice(summary.discountShare, currency, language)}</p>
                      <p className="font-bold text-accent">{t('الإجمالي', 'Total')}: {formatPrice(summary.total, currency, language)}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Button
            variant="ghost"
            onClick={() => {
              if (window.confirm(t('هل تريد تصفير الحساب؟', 'Reset bill?'))) {
                resetBill();
              }
            }}
          >
            {t('تصفير الحساب', 'Reset bill')}
          </Button>
        </div>
      </BottomSheet>
    </main>
  );
}
