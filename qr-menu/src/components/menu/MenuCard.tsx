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
    <button className="block min-h-11 w-full text-start transition-transform duration-calm ease-calm active:scale-[0.995]" onClick={onClick} aria-label={name}>
      <Card className="p-3">
        <div className="flex items-center gap-3">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-border bg-surface2">
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

          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold leading-snug text-text">{name}</h3>
            <p
              className="mt-1 text-[0.95rem] leading-6 text-muted"
              style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            >
              {description}
            </p>
            <p className="mt-2 text-base font-bold text-accent">{priceText}</p>
          </div>
        </div>
      </Card>
    </button>
  );
}
