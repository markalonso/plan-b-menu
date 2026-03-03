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
    <button className="group block min-h-11 w-full text-start transition-all duration-calm ease-calm active:scale-[0.98]" onClick={onClick} aria-label={name}>
      <Card className="relative overflow-hidden rounded-[26px] bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(248,242,236,0.8))] p-0 shadow-soft">
        <div className="grid grid-cols-[120px_minmax(0,1fr)] items-stretch md:grid-cols-[180px_minmax(0,1fr)]">
          <div className="relative overflow-hidden">
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
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
              />
            ) : null}
            {imageLoading || !item.image_url || imageFailed ? <div className="h-full min-h-[130px] w-full animate-pulse bg-gradient-to-br from-surface2 to-surface" aria-hidden="true" /> : null}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
          </div>

          <div className="flex min-w-0 flex-col justify-between p-4 md:p-5">
            <div className="min-w-0">
              <h3 className="font-heading text-xl leading-tight text-text md:text-2xl">{name}</h3>
              <p
                className="mt-2 text-sm leading-6 text-muted md:text-base"
                style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
              >
                {description}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.16em] text-muted">Chef Selection</span>
              <span className="inline-flex items-center rounded-full bg-accent px-3 py-1.5 text-sm font-semibold text-accentText shadow-soft md:text-base">{priceText}</span>
            </div>
          </div>
        </div>

        <span className="absolute bottom-3 end-3 inline-flex items-center rounded-full bg-accent px-3 py-1 text-sm font-semibold text-accentText shadow-soft">
          {priceText}
        </span>
      </Card>
    </button>
  );
}
