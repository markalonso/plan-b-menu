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
        <div className="space-y-5 pb-2">
          {/* Hero image — full-width, generous aspect ratio */}
          <div
            className="relative -mx-6 overflow-hidden bg-surface2"
            style={{ aspectRatio: '4/3' }}
          >
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
            {imageLoading || !item.image_url || imageFailed ? (
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accentSoft)]/50 to-surface2" aria-hidden="true" />
            ) : null}
          </div>

          {/* Description */}
          {desc ? (
            <p className="text-base leading-relaxed text-muted">
              {desc}
            </p>
          ) : (
            <p className="text-base leading-relaxed text-muted/60 italic">
              {t('لا يوجد وصف إضافي لهذا الصنف.', 'No extra description for this item.')}
            </p>
          )}

          {/* Tags */}
          {item.tags?.length ? (
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <Chip key={tag}>{tag}</Chip>
              ))}
            </div>
          ) : null}

          {/* Price — prominent, centered */}
          <div className="text-center py-2">
            <span className="font-heading text-3xl font-semibold text-accent">
              {formatPrice(item.price, currency, language)}
            </span>
          </div>

          {/* Actions */}
          <div className="grid gap-2 pb-2">
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
