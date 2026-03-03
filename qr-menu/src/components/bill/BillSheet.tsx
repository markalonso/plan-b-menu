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
  formatPrice
}: {
  open: boolean;
  onClose: () => void;
  language: 'ar' | 'en';
  t: (ar: string, en: string) => string;
  currency: string;
  formatPrice: (price: number, currency: string, language: 'ar' | 'en') => string;
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
      <div className="space-y-5 pb-2 md:space-y-6">
        <section className="space-y-3 rounded-3xl bg-surface2/90 p-4 shadow-soft">
          <h4 className="font-semibold">{t('الأصناف', 'Items')}</h4>
          {state.items.length === 0 ? (
            <p className="text-sm text-muted">{t('لا توجد أصناف في الحساب بعد.', 'No items in bill yet.')}</p>
          ) : (
            <div className="space-y-2">
              {state.items.map((item) => (
                <div key={item.id} className="rounded-2xl bg-surface p-3 shadow-soft">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{language === 'ar' ? item.name_ar : item.name_en}</p>
                      <p className="text-sm text-muted">{formatPrice(item.price, currency, language)}</p>
                    </div>
                    <Button variant="ghost" className="min-h-11 px-3" onClick={() => billActions.removeItem(item.id)} aria-label={t('حذف الصنف', 'Remove item')}>
                      {t('حذف', 'Remove')}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" className="h-11 min-h-11 w-11 rounded-xl px-0" onClick={() => billActions.changeQty(item.id, -1)} aria-label={t('تقليل الكمية', 'Decrease quantity')}>
                      -
                    </Button>
                    <span className="w-8 text-center font-semibold">{item.qty}</span>
                    <Button variant="secondary" className="h-11 min-h-11 w-11 rounded-xl px-0" onClick={() => billActions.changeQty(item.id, 1)} aria-label={t('زيادة الكمية', 'Increase quantity')}>
                      +
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-sm font-semibold">
            {t('المجموع الفرعي', 'Subtotal')}: {formatPrice(subtotal, currency, language)}
          </div>
        </section>

        <section className="space-y-3 rounded-3xl bg-surface2/90 p-4 shadow-soft">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold">{t('الضريبة', 'Tax')}</h4>
            <input type="checkbox" checked={state.taxEnabled} onChange={(event) => billActions.setTaxEnabled(event.target.checked)} className="h-5 w-5" />
          </div>
          <Input
            type="number"
            min={0}
            value={state.taxPercent}
            inputMode="decimal"
            max={100}
            onChange={(event) => billActions.setTaxPercent(parseNumeric(event.target.value))}
            placeholder="0"
            disabled={!state.taxEnabled}
          />
          <p className="text-sm text-muted">
            {t('قيمة الضريبة', 'Tax amount')}: {formatPrice(taxAmount, currency, language)}
          </p>
        </section>

        <section className="space-y-3 rounded-3xl bg-surface2/90 p-4 shadow-soft">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold">{t('الخصم', 'Discount')}</h4>
            <input type="checkbox" checked={state.discountEnabled} onChange={(event) => billActions.setDiscountEnabled(event.target.checked)} className="h-5 w-5" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant={state.discountType === 'percent' ? 'primary' : 'secondary'} onClick={() => billActions.setDiscountType('percent')}>
              {t('نسبة %', 'Percent %')}
            </Button>
            <Button variant={state.discountType === 'fixed' ? 'primary' : 'secondary'} onClick={() => billActions.setDiscountType('fixed')}>
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
          />
          <p className="text-sm text-muted">
            {t('قيمة الخصم', 'Discount amount')}: {formatPrice(discountAmount, currency, language)}
          </p>
        </section>

        <section className="space-y-3 rounded-3xl bg-surface2/90 p-4 shadow-soft">
          <h4 className="font-semibold">{t('تقسيم الحساب', 'Split')}</h4>
          <div className="grid grid-cols-3 gap-2">
            <Button variant={state.splitMode === 'none' ? 'primary' : 'secondary'} onClick={() => selectSplitMode('none')}>
              {t('بدون', 'None')}
            </Button>
            <Button variant={state.splitMode === 'equal' ? 'primary' : 'secondary'} onClick={() => selectSplitMode('equal')}>
              {t('متساوي', 'Equal')}
            </Button>
            <Button variant={state.splitMode === 'smart' ? 'primary' : 'secondary'} onClick={() => selectSplitMode('smart')}>
              {t('ذكي', 'Smart')}
            </Button>
          </div>

          {state.splitMode !== 'none' ? <Input type="number" min={1} max={20} inputMode="numeric" value={state.peopleCount} onChange={(event) => billActions.setPeopleCount(parseNumeric(event.target.value))} /> : null}

          {state.splitMode === 'equal' ? (
            <p className="text-sm font-semibold">
              {t('لكل شخص', 'Per person')}: {formatPrice(splitPerPerson, currency, language)}
            </p>
          ) : null}

          {state.splitMode === 'smart' ? (
            <div className="space-y-3"> 
              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                {personIds.map((personId, idx) => (
                  <Button key={personId} variant={activePerson === personId ? 'primary' : 'secondary'} className="whitespace-nowrap" onClick={() => setActivePerson(personId)}>
                    {t('الشخص', 'Person')} {idx + 1}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {personIds.map((personId, idx) => {
                  const summary = getSmartPersonSummary(state, personId);
                  return (
                    <div key={`summary-${personId}`} className="rounded-xl bg-surface p-2 text-xs text-muted shadow-soft">
                      <p className="font-semibold text-text">{t('الشخص', 'Person')} {idx + 1}</p>
                      <p>{t('الإجمالي', 'Total')}: {formatPrice(summary.total, currency, language)}</p>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-3xl bg-surface p-4 space-y-3 shadow-soft">
                <p className="font-semibold">
                  {t('الشخص', 'Person')} {Number(activePerson)}
                </p>
                <div className="space-y-2">
                  {state.items.map((item) => {
                    const assigned = state.smartSplit.find((entry) => entry.personId === activePerson)?.items.find((entry) => entry.itemId === item.id)?.qty ?? 0;
                    return (
                      <div key={`${activePerson}-${item.id}`} className="flex items-center justify-between gap-2 text-sm">
                        <span>{language === 'ar' ? item.name_ar : item.name_en}</span>
                        <div className="flex items-center gap-2">
                          <Button variant="secondary" className="h-11 min-h-11 w-11 rounded-xl px-0" onClick={() => billActions.assignItem(activePerson, item.id, -1)} aria-label={t('تقليل حصة الصنف', 'Decrease assigned quantity')}>
                            -
                          </Button>
                          <span className="w-6 text-center">{assigned}</span>
                          <Button variant="secondary" className="h-11 min-h-11 w-11 rounded-xl px-0" onClick={() => billActions.assignItem(activePerson, item.id, 1)} aria-label={t('زيادة حصة الصنف', 'Increase assigned quantity')}>
                            +
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-1 text-sm text-muted">
                  <p>{t('المجموع الفرعي', 'Subtotal')}: {formatPrice(activePersonSummary.subtotal, currency, language)}</p>
                  <p>{t('حصة الضريبة', 'Tax share')}: {formatPrice(activePersonSummary.taxShare, currency, language)}</p>
                  <p>{t('حصة الخصم', 'Discount share')}: {formatPrice(activePersonSummary.discountShare, currency, language)}</p>
                  <p className="font-semibold text-text">{t('الإجمالي', 'Total')}: {formatPrice(activePersonSummary.total, currency, language)}</p>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <section className="rounded-3xl bg-[color:var(--accentSoft)] p-4">
          <p className="text-lg font-bold text-accent">
            {t('الإجمالي', 'Total')}: {formatPrice(total, currency, language)}
          </p>
        </section>

        <Button variant="secondary" onClick={onReset}>
          {t('إعادة ضبط الحساب', 'Reset bill')}
        </Button>
      </div>
    </BottomSheet>
  );
}
