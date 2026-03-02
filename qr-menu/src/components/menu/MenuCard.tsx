import { useState } from 'react';
import Card from '../Card';
import type { MenuItem } from '../../lib/api/menu';

export default function MenuCard({
  item,
  name,
  description,
  priceText,
  onClick
}: {
  item: MenuItem;
  name: string;
  description: string;
  priceText: string;
  onClick: () => void;
}) {
  const [imageLoading, setImageLoading] = useState(Boolean(item.image_url));
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <button className="block min-h-11 w-full text-start transition-all duration-calm ease-calm active:scale-[0.98]" onClick={onClick} aria-label={name}>
      <Card className="relative overflow-hidden rounded-[20px] p-3 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-surface2">
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
                className="h-full w-full object-cover"
              />
            ) : null}

            {imageLoading || !item.image_url || imageFailed ? <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-surface2 to-surface" aria-hidden="true" /> : null}
          </div>

          <div className="min-w-0 flex-1 pe-2">
            <h3 className="text-lg font-bold leading-snug text-text">{name}</h3>
            <p
              className="mt-1 text-[0.95rem] leading-6 text-muted"
              style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            >
              {description}
            </p>
          </div>
        </div>

        <span className="absolute bottom-3 end-3 inline-flex items-center rounded-full bg-accent px-3 py-1 text-sm font-semibold text-accentText shadow-soft">
          {priceText}
        </span>
      </Card>
    </button>
  );
}
