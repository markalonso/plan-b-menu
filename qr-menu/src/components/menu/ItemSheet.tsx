import { useEffect, useState } from 'react';
import BottomSheet from '../BottomSheet';
import Button from '../Button';
import type { MenuItem } from '../../lib/api/menu';

export default function ItemSheet({
  open,
  item,
  onClose,
  onAdd,
  language,
  t,
  currency,
  getMenuPriceText
}: {
  open: boolean;
  item: MenuItem | null;
  onClose: () => void;
  onAdd: (item: MenuItem, quantity: number) => void;
  language: 'ar' | 'en';
  t: (ar: string, en: string) => string;
  currency: string;
  getMenuPriceText: (item: MenuItem, currency: string, language: 'ar' | 'en') => string;
}) {
  const [imageLoading, setImageLoading] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const name = item ? (language === 'ar' ? item.name_ar : item.name_en) : '';
  const desc = item ? (language === 'ar' ? item.desc_ar ?? '' : item.desc_en ?? '') : '';
  const trimmedDesc = desc.trim();

  useEffect(() => {
    setImageFailed(false);
    setImageLoading(Boolean(item?.image_url));
  }, [item?.id, item?.image_url]);

  useEffect(() => {
    if (open) setQuantity(1);
  }, [open, item?.id]);

  function decrementQty() {
    setQuantity((prev) => Math.max(1, prev - 1));
  }

  function incrementQty() {
    setQuantity((prev) => prev + 1);
  }

  function handleAdd(targetItem: MenuItem) {
    onAdd(targetItem, quantity);
    setQuantity(1);
  }

  function handleClose() {
    setQuantity(1);
    onClose();
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title={name}>
      {item ? (
        <div className="space-y-4 pb-2">
          {/* Hero image */}
          <div className="relative overflow-hidden rounded-2xl bg-surface2" style={{ aspectRatio: '16/9' }}>
            {item.image_url && !imageFailed ? (
              <img
                src={item.image_url}
                alt={name}
                loading="lazy"
                decoding="async"
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageLoading(false);
                  setImageFailed(true);
                }}
                onLoadStart={() => setImageLoading(true)}
                className="h-full w-full object-cover"
              />
            ) : null}
            {(imageLoading || !item.image_url || imageFailed) && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-surface2 via-surface to-surface2" aria-hidden="true" />
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/25 to-transparent" />
          </div>

          {/* Description */}
          {(trimmedDesc || (item.tags?.length ?? 0) > 0) && (
            <div className="rounded-2xl bg-surface2 px-4 py-4">
              {trimmedDesc ? (
                <p className="text-sm leading-relaxed text-muted">{trimmedDesc}</p>
              ) : null}
              {item.tags?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center rounded-full bg-surface px-3 py-1 text-xs font-medium text-muted shadow-soft">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {/* Price row */}
          <div className="flex items-center justify-between rounded-2xl bg-[color:var(--accentSoft)] px-4 py-3">
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-muted">{t('السعر', 'Price')}</p>
            <p className="font-heading text-2xl font-bold text-accent">{getMenuPriceText(item, currency, language)}</p>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-2xl bg-surface2 p-2">
              <div className="flex shrink-0 items-center gap-2 rounded-full bg-surface px-2 py-1 shadow-soft">
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted">{t('الكمية', 'Qty')}</span>
                <button
                  type="button"
                  onClick={decrementQty}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-lg font-semibold text-text transition hover:bg-interactiveSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary-focus-ring)]"
                  aria-label={t('تقليل الكمية', 'Decrease quantity')}
                >
                  −
                </button>
                <span className="min-w-8 text-center text-sm font-semibold tabular-nums text-text" aria-live="polite" aria-atomic="true">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={incrementQty}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-lg font-semibold text-text transition hover:bg-interactiveSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary-focus-ring)]"
                  aria-label={t('زيادة الكمية', 'Increase quantity')}
                >
                  +
                </button>
              </div>
              <Button className="flex-1" onClick={() => handleAdd(item)}>
                {t('أضف للحساب', 'Add to bill')}
              </Button>
            </div>
            <Button variant="secondary" onClick={handleClose} className="w-full">
              {t('إغلاق', 'Close')}
            </Button>
          </div>
        </div>
      ) : null}
    </BottomSheet>
  );
}
