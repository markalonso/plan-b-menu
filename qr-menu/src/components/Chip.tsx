import { ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export default function Chip({ active = false, className, ...props }: ChipProps) {
  return (
    <button
      className={cn(
        'min-h-11 rounded-full px-4 text-sm font-medium shadow-soft transition-all duration-calm ease-calm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary-focus-ring)] focus-visible:ring-offset-2 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none motion-reduce:transform-none',
        active
          ? 'bg-primary text-primaryText shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] hover:bg-primaryHover active:bg-primaryActive'
          : 'bg-interactiveSoft text-muted hover:bg-interactiveSoftHover hover:text-text active:bg-interactiveSoftActive',
        className
      )}
      {...props}
    />
  );
}
