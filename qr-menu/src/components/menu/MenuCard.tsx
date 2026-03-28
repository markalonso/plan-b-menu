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
  description?: string;
  priceText: string;
  onClick: () => void;
}) {
  const [imageLoading, setImageLoading] = useState(Boolean(item.image_url));
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <button
      className="group block min-h-11 w-full text-start transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary-focus-ring)] focus-visible:ring-offset-2"
      onClick={onClick}
      aria-label={name}
    >
      <article className="relative overflow-hidden rounded-[26px] border border-cardBorder bg-cardBg shadow-soft transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:shadow-elevate group-active:scale-[0.98]">
        {/* Image */}
        <div className="relative overflow-hidden bg-surface2" style={{ aspectRatio: '16/10' }}>
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
              className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
            />
          ) : null}
          {(imageLoading || !item.image_url || imageFailed) && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-surface2 via-surface to-surface2" aria-hidden="true" />
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
          {/* Price badge */}
          <span className="absolute bottom-3 end-3 inline-flex items-center rounded-full border border-priceBadgeBorder bg-priceBadgeBg px-3 py-1 text-sm font-semibold text-priceBadgeText shadow-soft backdrop-blur-sm">
            {priceText}
          </span>
        </div>

        {/* Content */}
        <div className="p-3.5 md:p-4">
          <h3 className="font-heading text-lg leading-snug text-text">{name}</h3>
          {description ? (
            <p
              className="mt-1.5 text-sm leading-relaxed text-muted"
              style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            >
              {description}
            </p>
          ) : null}
        </div>
      </article>
    </button>
  );
}
