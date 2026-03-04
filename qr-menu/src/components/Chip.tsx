import { ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export default function Chip({ active = false, className, ...props }: ChipProps) {
  return (
    <button
      className={cn(
        'min-h-11 rounded-full px-4 text-sm font-medium shadow-soft transition-all duration-calm ease-calm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary-focus-ring)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        active
          ? 'bg-primary text-primaryText hover:bg-primaryHover active:bg-primaryActive'
          : 'bg-interactiveSoft text-muted hover:bg-interactiveSoftHover hover:text-text active:bg-interactiveSoftActive',
        className
      )}
      {...props}
    />
  );
}
