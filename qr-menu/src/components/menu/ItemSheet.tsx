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
  onAdd: (item: MenuItem) => void;
  language: 'ar' | 'en';
  t: (ar: string, en: string) => string;
  currency: string;
  getMenuPriceText: (item: MenuItem, currency: string, language: 'ar' | 'en') => string;
}) {
  const [imageLoading, setImageLoading] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const name = item ? (language === 'ar' ? item.name_ar : item.name_en) : '';
  const desc = item ? (language === 'ar' ? item.desc_ar ?? '' : item.desc_en ?? '') : '';

  useEffect(() => {
    setImageFailed(false);
    setImageLoading(Boolean(item?.image_url));
  }, [item?.id, item?.image_url]);

  return (
    <BottomSheet open={open} onClose={onClose} title={name}>
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
          {(desc || (item.tags?.length ?? 0) > 0) && (
            <div className="rounded-2xl bg-surface2 px-4 py-4">
              {desc ? (
                <p className="text-sm leading-relaxed text-muted">{desc}</p>
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
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button onClick={() => onAdd(item)}>{t('أضف للحساب', 'Add to bill')}</Button>
            <Button variant="secondary" onClick={onClose}>
              {t('إغلاق', 'Close')}
            </Button>
          </div>
        </div>
      ) : null}
    </BottomSheet>
  );
}
