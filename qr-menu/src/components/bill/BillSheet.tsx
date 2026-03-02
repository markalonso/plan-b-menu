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
    <BottomSheet open={open} onClose={onClose} title={t('الحساب', 'Check')}>
      <div className="space-y-6 pb-4">

        {/* ─── Items — table check list style ─── */}
        <section>
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted/70">{t('الأصناف', 'Items')}</p>
          {state.items.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted">{t('لا توجد أصناف في الحساب بعد.', 'No items added yet.')}</p>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {state.items.map((item) => (
                <div key={item.id} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium leading-snug">{language === 'ar' ? item.name_ar : item.name_en}</p>
                      <p className="text-sm text-muted">{formatPrice(item.price, currency, language)} × {item.qty}</p>
                    </div>
                    <p className="shrink-0 font-semibold text-text">
                      {formatPrice(item.price * item.qty, currency, language)}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-muted transition hover:border-text hover:text-text"
                      onClick={() => billActions.changeQty(item.id, -1)}
                      aria-label={t('تقليل الكمية', 'Decrease quantity')}
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-muted transition hover:border-text hover:text-text"
                      onClick={() => billActions.changeQty(item.id, 1)}
                      aria-label={t('زيادة الكمية', 'Increase quantity')}
                    >
                      +
                    </button>
                    <button
                      className="ms-auto text-xs text-muted/60 transition hover:text-muted"
                      onClick={() => billActions.removeItem(item.id)}
                      aria-label={t('حذف الصنف', 'Remove item')}
                    >
                      {t('حذف', 'Remove')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Subtotal line */}
          <div className="mt-2 flex justify-between border-t border-[var(--border)] pt-3 text-sm">
            <span className="text-muted">{t('المجموع الفرعي', 'Subtotal')}</span>
            <span className="font-medium">{formatPrice(subtotal, currency, language)}</span>
          </div>
        </section>

        {/* ─── Tax ─── */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-muted/70">{t('الضريبة', 'Tax')}</p>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
              <input type="checkbox" checked={state.taxEnabled} onChange={(e) => billActions.setTaxEnabled(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
              {t('تفعيل', 'Enable')}
            </label>
          </div>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min={0}
              value={state.taxPercent}
              inputMode="decimal"
              max={100}
              onChange={(e) => billActions.setTaxPercent(parseNumeric(e.target.value))}
              placeholder="0"
              disabled={!state.taxEnabled}
              className="flex-1"
            />
            <span className="shrink-0 text-sm text-muted">
              = {formatPrice(taxAmount, currency, language)}
            </span>
          </div>
        </section>

        {/* ─── Discount ─── */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-muted/70">{t('الخصم', 'Discount')}</p>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
              <input type="checkbox" checked={state.discountEnabled} onChange={(e) => billActions.setDiscountEnabled(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
              {t('تفعيل', 'Enable')}
            </label>
          </div>
          <div className="mb-3 flex gap-2">
            <button
              onClick={() => billActions.setDiscountType('percent')}
              className={[
                'rounded-full border px-4 py-1.5 text-sm transition',
                state.discountType === 'percent'
                  ? 'border-[var(--text)] bg-[var(--text)] text-[var(--bg)]'
                  : 'border-[var(--divider)] text-muted'
              ].join(' ')}
            >
              {t('نسبة %', '%')}
            </button>
            <button
              onClick={() => billActions.setDiscountType('fixed')}
              className={[
                'rounded-full border px-4 py-1.5 text-sm transition',
                state.discountType === 'fixed'
                  ? 'border-[var(--text)] bg-[var(--text)] text-[var(--bg)]'
                  : 'border-[var(--divider)] text-muted'
              ].join(' ')}
            >
              {t('قيمة ثابتة', 'Fixed')}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min={0}
              value={state.discountValue}
              inputMode="decimal"
              onChange={(e) => billActions.setDiscountValue(parseNumeric(e.target.value))}
              placeholder="0"
              disabled={!state.discountEnabled}
              className="flex-1"
            />
            <span className="shrink-0 text-sm text-muted">
              − {formatPrice(discountAmount, currency, language)}
            </span>
          </div>
        </section>

        {/* ─── Split ─── */}
        <section>
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted/70">{t('تقسيم الحساب', 'Split')}</p>
          <div className="flex gap-2">
            {(['none', 'equal', 'smart'] as SplitMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => selectSplitMode(mode)}
                className={[
                  'rounded-full border px-4 py-1.5 text-sm transition',
                  state.splitMode === mode
                    ? 'border-[var(--text)] bg-[var(--text)] text-[var(--bg)]'
                    : 'border-[var(--divider)] text-muted'
                ].join(' ')}
              >
                {mode === 'none' ? t('بدون', 'None') : mode === 'equal' ? t('متساوي', 'Equal') : t('ذكي', 'Smart')}
              </button>
            ))}
          </div>

          {state.splitMode !== 'none' ? (
            <div className="mt-3">
              <Input
                type="number"
                min={1}
                max={20}
                inputMode="numeric"
                value={state.peopleCount}
                onChange={(e) => billActions.setPeopleCount(parseNumeric(e.target.value))}
              />
            </div>
          ) : null}

          {state.splitMode === 'equal' ? (
            <p className="mt-3 text-sm font-medium">
              {t('لكل شخص', 'Per person')}: {formatPrice(splitPerPerson, currency, language)}
            </p>
          ) : null}

          {state.splitMode === 'smart' ? (
            <div className="mt-4 space-y-4">
              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                {personIds.map((personId, idx) => (
                  <button
                    key={personId}
                    onClick={() => setActivePerson(personId)}
                    className={[
                      'whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition',
                      activePerson === personId
                        ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accentText)]'
                        : 'border-[var(--divider)] text-muted'
                    ].join(' ')}
                  >
                    {t('الشخص', 'Person')} {idx + 1}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {personIds.map((personId, idx) => {
                  const summary = getSmartPersonSummary(state, personId);
                  return (
                    <div key={`summary-${personId}`} className="rounded-2xl border border-[var(--border)] bg-surface2 p-3 text-xs">
                      <p className="font-medium text-text">{t('الشخص', 'Person')} {idx + 1}</p>
                      <p className="mt-1 text-muted">{formatPrice(summary.total, currency, language)}</p>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-surface2 p-4 space-y-3">
                <p className="text-sm font-semibold">{t('الشخص', 'Person')} {Number(activePerson)}</p>
                <div className="space-y-2">
                  {state.items.map((item) => {
                    const assigned = state.smartSplit.find((entry) => entry.personId === activePerson)?.items.find((entry) => entry.itemId === item.id)?.qty ?? 0;
                    return (
                      <div key={`${activePerson}-${item.id}`} className="flex items-center justify-between gap-2 text-sm">
                        <span className="text-muted">{language === 'ar' ? item.name_ar : item.name_en}</span>
                        <div className="flex items-center gap-2">
                          <button
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] text-muted transition hover:border-text hover:text-text"
                            onClick={() => billActions.assignItem(activePerson, item.id, -1)}
                            aria-label={t('تقليل حصة الصنف', 'Decrease assigned quantity')}
                          >
                            −
                          </button>
                          <span className="w-5 text-center font-semibold">{assigned}</span>
                          <button
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] text-muted transition hover:border-text hover:text-text"
                            onClick={() => billActions.assignItem(activePerson, item.id, 1)}
                            aria-label={t('زيادة حصة الصنف', 'Increase assigned quantity')}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-1 border-t border-[var(--border)] pt-3 text-sm text-muted">
                  <div className="flex justify-between"><span>{t('المجموع الفرعي', 'Subtotal')}</span><span>{formatPrice(activePersonSummary.subtotal, currency, language)}</span></div>
                  <div className="flex justify-between"><span>{t('حصة الضريبة', 'Tax share')}</span><span>{formatPrice(activePersonSummary.taxShare, currency, language)}</span></div>
                  <div className="flex justify-between"><span>{t('حصة الخصم', 'Discount share')}</span><span>− {formatPrice(activePersonSummary.discountShare, currency, language)}</span></div>
                  <div className="flex justify-between font-semibold text-text pt-1 border-t border-[var(--border)]">
                    <span>{t('الإجمالي', 'Total')}</span>
                    <span>{formatPrice(activePersonSummary.total, currency, language)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        {/* ─── Grand Total ─── */}
        <section className="rounded-[var(--r-2xl)] bg-[var(--text)] px-5 py-4 text-[var(--bg)]">
          <div className="flex items-center justify-between">
            <span className="text-sm uppercase tracking-[0.15em] opacity-70">{t('الإجمالي', 'Total')}</span>
            <span className="font-heading text-2xl font-semibold">{formatPrice(total, currency, language)}</span>
          </div>
        </section>

        <Button variant="secondary" onClick={onReset} className="w-full">
          {t('إعادة ضبط الحساب', 'Reset bill')}
        </Button>
      </div>
    </BottomSheet>
  );
}
