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
        <div className="space-y-4">
          <div className="relative h-52 w-full overflow-hidden rounded-3xl border border-border bg-surface2">
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
            {imageLoading || !item.image_url || imageFailed ? <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-surface2 to-surface" aria-hidden="true" /> : null}
          </div>

          <p className="text-base text-muted">{desc || t('لا يوجد وصف إضافي لهذا الصنف.', 'No extra description for this item.')}</p>

          {item.tags?.length ? (
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <Chip key={tag}>{tag}</Chip>
              ))}
            </div>
          ) : null}

          <div className="rounded-2xl bg-surface2 px-4 py-3 text-lg font-bold text-accent">{formatPrice(item.price, currency, language)}</div>

          <div className="grid grid-cols-1 gap-2">
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
