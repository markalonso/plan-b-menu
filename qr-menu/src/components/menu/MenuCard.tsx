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
  return (
    <button className="block w-full text-start transition-transform duration-calm ease-calm active:scale-[0.995]" onClick={onClick} aria-label={name}>
      <Card className="p-3">
        <div className="flex items-center gap-3">
          {item.image_url ? (
            <img src={item.image_url} alt={name} loading="lazy" decoding="async" className="h-24 w-24 shrink-0 rounded-2xl border border-border object-cover" />
          ) : (
            <div className="h-24 w-24 shrink-0 rounded-2xl border border-border bg-gradient-to-br from-surface2 to-surface" aria-hidden="true" />
          )}

          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold leading-tight text-text">{name}</h3>
            <p
              className="mt-1 text-sm text-muted"
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
