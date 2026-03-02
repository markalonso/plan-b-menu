import { useState } from 'react';
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

  const hasImage = item.image_url && !imageFailed;

  return (
    <button
      className="group block w-full text-start transition-all duration-300 ease-out active:scale-[0.985]"
      onClick={onClick}
      aria-label={name}
    >
      <article className="overflow-hidden rounded-[var(--r-3xl)] bg-surface shadow-[var(--shadow-sm)] transition-shadow duration-300 group-hover:shadow-[var(--shadow-md)]">
        {/* Image area — editorial proportions */}
        <div className="relative overflow-hidden bg-surface2" style={{ aspectRatio: '16/9' }}>
          {hasImage ? (
            <img
              src={item.image_url!}
              alt={name}
              loading="lazy"
              decoding="async"
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageFailed(true);
              }}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          ) : null}
          {imageLoading || !item.image_url || imageFailed ? (
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accentSoft)]/40 to-surface2" aria-hidden="true" />
          ) : null}
        </div>

        {/* Content area */}
        <div className="flex items-end justify-between gap-3 px-5 py-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-lg font-semibold leading-snug text-text">{name}</h3>
            <p
              className="mt-1 text-sm leading-relaxed text-muted"
              style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            >
              {description}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-[var(--accentSoft)] px-3 py-1 text-sm font-semibold text-accent">
            {priceText}
          </span>
        </div>
      </article>
    </button>
  );
}
