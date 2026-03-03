import { useEffect, useState } from 'react';
import BottomSheet from '../BottomSheet';
import Button from '../Button';
import Chip from '../Chip';
import type { MenuItem } from '../../lib/api/menu';

export default function ItemSheet({
  open,
  item,
  onClose,
  onAdd,
  language,
  t,
  currency,
  formatPrice
}: {
  open: boolean;
  item: MenuItem | null;
  onClose: () => void;
  onAdd: (item: MenuItem) => void;
  language: 'ar' | 'en';
  t: (ar: string, en: string) => string;
  currency: string;
  formatPrice: (price: number, currency: string, language: 'ar' | 'en') => string;
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
        <div className="space-y-5 pb-1">
          <div className="relative overflow-hidden rounded-[26px] bg-surface2">
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
                className="h-[240px] w-full object-cover md:h-[320px]"
              />
            ) : null}
            {imageLoading || !item.image_url || imageFailed ? <div className="h-[240px] w-full animate-pulse bg-gradient-to-br from-surface2 to-surface md:h-[320px]" aria-hidden="true" /> : null}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          <div className="rounded-3xl bg-surface2 p-4 md:p-5">
            <p className="text-sm leading-7 text-muted md:text-base">{desc || t('لا يوجد وصف إضافي لهذا الصنف.', 'No extra description for this item.')}</p>
            {item.tags?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <Chip key={tag}>{tag}</Chip>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-[color:var(--accentSoft)] px-4 py-3">
            <p className="text-sm uppercase tracking-[0.18em] text-muted">{t('السعر', 'Price')}</p>
            <p className="text-xl font-bold text-accent md:text-2xl">{formatPrice(item.price, currency, language)}</p>
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
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
