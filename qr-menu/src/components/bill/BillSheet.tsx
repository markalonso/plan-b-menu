import { useEffect, useMemo, useState } from 'react';
import BottomSheet from '../BottomSheet';
import Button from '../Button';
import Input from '../Input';
import {
  billActions,
  getDiscountAmount,
  getSmartPersonSummary,
  getSubtotal,
  getTaxAmount,
  getTotal,
  useBillStore,
  type SplitMode
} from '../../lib/bill/store';

export default function BillSheet({
  open,
  onClose,
  language,
  t,
  currency,
  formatPrice,
  vatNote
}: {
  open: boolean;
  onClose: () => void;
  language: 'ar' | 'en';
  t: (ar: string, en: string) => string;
  currency: string;
  formatPrice: (price: number, currency: string, language: 'ar' | 'en') => string;
  vatNote?: string;
}) {
  const state = useBillStore();
  const [activePerson, setActivePerson] = useState('1');
  const subtotal = getSubtotal(state);
  const taxAmount = getTaxAmount(state, subtotal);
  const discountAmount = getDiscountAmount(state, subtotal);
  const total = getTotal(state);

  const personIds = useMemo(() => Array.from({ length: state.peopleCount }, (_, idx) => String(idx + 1)), [state.peopleCount]);

  const splitPerPerson = state.peopleCount > 0 ? total / Math.max(1, state.peopleCount) : 0;

  useEffect(() => {
    if (!personIds.includes(activePerson)) {
      setActivePerson(personIds[0] ?? '1');
    }
  }, [activePerson, personIds]);

  function parseNumeric(value: string) {
    const next = Number(value);
    return Number.isFinite(next) ? next : 0;
  }

  function selectSplitMode(mode: SplitMode) {
    billActions.setSplitMode(mode);
    if (mode === 'smart') {
      setActivePerson('1');
    }
  }

  function onReset() {
    if (window.confirm(t('هل تريد إعادة ضبط الحساب؟', 'Reset bill calculator?'))) {
      billActions.reset();
      setActivePerson('1');
      onClose();
    }
  }

  const activePersonSummary = getSmartPersonSummary(state, activePerson);

  return (
    <BottomSheet open={open} onClose={onClose} title={t('حاسبة الحساب', 'Bill Preview')}>
      <div className="space-y-4 pb-2">

        {/* Items section */}
        <section className="rounded-2xl bg-surface2 p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-muted">{t('الأصناف', 'Items')}</h4>
          {state.items.length === 0 ? (
            <p className="text-sm text-muted">{t('لا توجد أصناف في الحساب بعد.', 'No items in bill yet.')}</p>
          ) : (
            <div className="space-y-2">
              {state.items.map((item) => (
                <div key={item.id} className="rounded-xl bg-surface px-3 py-2.5 shadow-soft">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium leading-tight">{language === 'ar' ? item.name_ar : item.name_en}</p>
                      <p className="mt-0.5 text-sm text-muted">{formatPrice(item.price, currency, language)}</p>
                    </div>
                    <Button variant="ghost" className="h-8 min-h-8 px-2 text-xs" onClick={() => billActions.removeItem(item.id)} aria-label={t('حذف الصنف', 'Remove item')}>
                      {t('حذف', 'Remove')}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" className="h-9 min-h-9 w-9 rounded-lg px-0 text-base" onClick={() => billActions.changeQty(item.id, -1)} aria-label={t('تقليل الكمية', 'Decrease quantity')}>
                      −
                    </Button>
                    <span className="w-8 text-center font-semibold">{item.qty}</span>
                    <Button variant="secondary" className="h-9 min-h-9 w-9 rounded-lg px-0 text-base" onClick={() => billActions.changeQty(item.id, 1)} aria-label={t('زيادة الكمية', 'Increase quantity')}>
                      +
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {state.items.length > 0 && (
            <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3 text-sm">
              <span className="text-muted">{t('المجموع الفرعي', 'Subtotal')}</span>
              <span className="font-semibold">{formatPrice(subtotal, currency, language)}</span>
            </div>
          )}
        </section>

        {/* Tax section */}
        <section className="rounded-2xl bg-surface2 p-4">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">{t('الضريبة', 'Tax')}</h4>
            <input type="checkbox" checked={state.taxEnabled} onChange={(event) => billActions.setTaxEnabled(event.target.checked)} className="h-4 w-4" />
          </div>
          <div className="mt-3 space-y-2">
            <Input
              type="number"
              min={0}
              value={state.taxPercent}
              inputMode="decimal"
              max={100}
              onChange={(event) => billActions.setTaxPercent(parseNumeric(event.target.value))}
              placeholder="0"
              disabled={!state.taxEnabled}
              className="rounded-xl"
            />
            <p className="flex items-center justify-between text-sm">
              <span className="text-muted">{t('قيمة الضريبة', 'Tax amount')}</span>
              <span className="font-medium">{formatPrice(taxAmount, currency, language)}</span>
            </p>
            {vatNote ? <p className="text-xs text-muted">{vatNote}</p> : null}
          </div>
        </section>

        {/* Discount section */}
        <section className="rounded-2xl bg-surface2 p-4">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">{t('الخصم', 'Discount')}</h4>
            <input type="checkbox" checked={state.discountEnabled} onChange={(event) => billActions.setDiscountEnabled(event.target.checked)} className="h-4 w-4" />
          </div>
          <div className="mt-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button variant={state.discountType === 'percent' ? 'primary' : 'secondary'} className="h-9 min-h-9 text-sm" onClick={() => billActions.setDiscountType('percent')}>
                {t('نسبة %', 'Percent %')}
              </Button>
              <Button variant={state.discountType === 'fixed' ? 'primary' : 'secondary'} className="h-9 min-h-9 text-sm" onClick={() => billActions.setDiscountType('fixed')}>
                {t('قيمة ثابتة', 'Fixed')}
              </Button>
            </div>
            <Input
              type="number"
              min={0}
              value={state.discountValue}
              inputMode="decimal"
              onChange={(event) => billActions.setDiscountValue(parseNumeric(event.target.value))}
              placeholder="0"
              disabled={!state.discountEnabled}
              className="rounded-xl"
            />
            <p className="flex items-center justify-between text-sm">
              <span className="text-muted">{t('قيمة الخصم', 'Discount amount')}</span>
              <span className="font-medium">{formatPrice(discountAmount, currency, language)}</span>
            </p>
          </div>
        </section>

        {/* Split section */}
        <section className="rounded-2xl bg-surface2 p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-muted">{t('تقسيم الحساب', 'Split bill')}</h4>
          <div className="grid grid-cols-3 gap-2">
            <Button variant={state.splitMode === 'none' ? 'primary' : 'secondary'} className="h-9 min-h-9 text-sm" onClick={() => selectSplitMode('none')}>
              {t('بدون', 'None')}
            </Button>
            <Button variant={state.splitMode === 'equal' ? 'primary' : 'secondary'} className="h-9 min-h-9 text-sm" onClick={() => selectSplitMode('equal')}>
              {t('متساوي', 'Equal')}
            </Button>
            <Button variant={state.splitMode === 'smart' ? 'primary' : 'secondary'} className="h-9 min-h-9 text-sm" onClick={() => selectSplitMode('smart')}>
              {t('ذكي', 'Smart')}
            </Button>
          </div>

          {state.splitMode !== 'none' ? (
            <div className="mt-3">
              <Input
                type="number"
                min={1}
                max={20}
                inputMode="numeric"
                value={state.peopleCount}
                onChange={(event) => billActions.setPeopleCount(parseNumeric(event.target.value))}
                className="rounded-xl"
              />
            </div>
          ) : null}

          {state.splitMode === 'equal' ? (
            <div className="mt-3 flex items-center justify-between rounded-xl bg-[color:var(--accentSoft)] px-3 py-2.5 text-sm">
              <span className="text-muted">{t('لكل شخص', 'Per person')}</span>
              <span className="font-semibold text-accent">{formatPrice(splitPerPerson, currency, language)}</span>
            </div>
          ) : null}

          {state.splitMode === 'smart' ? (
            <div className="mt-3 space-y-3">
              <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
                {personIds.map((personId, idx) => (
                  <Button key={personId} variant={activePerson === personId ? 'primary' : 'secondary'} className="h-9 min-h-9 shrink-0 whitespace-nowrap text-sm" onClick={() => setActivePerson(personId)}>
                    {t('الشخص', 'P')} {idx + 1}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {personIds.map((personId, idx) => {
                  const summary = getSmartPersonSummary(state, personId);
                  return (
                    <div key={`summary-${personId}`} className="rounded-xl bg-surface p-2.5 text-xs shadow-soft">
                      <p className="font-semibold text-text">{t('الشخص', 'Person')} {idx + 1}</p>
                      <p className="mt-0.5 text-muted">{formatPrice(summary.total, currency, language)}</p>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-xl bg-surface p-3.5 shadow-soft">
                <p className="mb-2 text-sm font-semibold">
                  {t('الشخص', 'Person')} {Number(activePerson)}
                </p>
                <div className="space-y-2">
                  {state.items.map((item) => {
                    const assigned = state.smartSplit.find((entry) => entry.personId === activePerson)?.items.find((entry) => entry.itemId === item.id)?.qty ?? 0;
                    return (
                      <div key={`${activePerson}-${item.id}`} className="flex items-center justify-between gap-2 text-sm">
                        <span className="min-w-0 truncate">{language === 'ar' ? item.name_ar : item.name_en}</span>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <Button variant="secondary" className="h-8 min-h-8 w-8 rounded-lg px-0 text-sm" onClick={() => billActions.assignItem(activePerson, item.id, -1)} aria-label={t('تقليل حصة الصنف', 'Decrease assigned quantity')}>
                            −
                          </Button>
                          <span className="w-5 text-center text-sm">{assigned}</span>
                          <Button variant="secondary" className="h-8 min-h-8 w-8 rounded-lg px-0 text-sm" onClick={() => billActions.assignItem(activePerson, item.id, 1)} aria-label={t('زيادة حصة الصنف', 'Increase assigned quantity')}>
                            +
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 space-y-1 border-t border-border/50 pt-3 text-xs text-muted">
                  <p className="flex justify-between"><span>{t('المجموع الفرعي', 'Subtotal')}</span><span>{formatPrice(activePersonSummary.subtotal, currency, language)}</span></p>
                  <p className="flex justify-between"><span>{t('حصة الضريبة', 'Tax share')}</span><span>{formatPrice(activePersonSummary.taxShare, currency, language)}</span></p>
                  <p className="flex justify-between"><span>{t('حصة الخصم', 'Discount share')}</span><span>{formatPrice(activePersonSummary.discountShare, currency, language)}</span></p>
                  <p className="flex justify-between font-semibold text-text"><span>{t('الإجمالي', 'Total')}</span><span>{formatPrice(activePersonSummary.total, currency, language)}</span></p>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        {/* Total */}
        <section className="rounded-2xl bg-[color:var(--accentSoft)] px-4 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted">{t('الإجمالي', 'Total')}</p>
            <p className="font-heading text-2xl font-bold text-accent">{formatPrice(total, currency, language)}</p>
          </div>
        </section>

        <Button variant="secondary" className="w-full" onClick={onReset}>
          {t('إعادة ضبط الحساب', 'Reset bill')}
        </Button>
      </div>
    </BottomSheet>
  );
}
