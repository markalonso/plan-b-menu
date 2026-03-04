import { ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

export default function Button({ className, variant = 'primary', ...props }: Props) {
  return (
    <button
      className={cn(
        'inline-flex min-h-11 items-center justify-center rounded-full px-5 text-[0.95rem] font-semibold transition-all duration-calm ease-calm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary-focus-ring)] focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed',
        variant === 'primary' && 'bg-primary text-primaryText shadow-soft hover:-translate-y-0.5 hover:bg-primaryHover active:bg-primaryActive disabled:bg-primaryDisabled disabled:text-primaryTextDisabled',
        variant === 'secondary' && 'bg-interactiveSoft text-text shadow-soft hover:-translate-y-0.5 hover:bg-interactiveSoftHover active:bg-interactiveSoftActive',
        variant === 'ghost' && 'bg-transparent text-muted hover:bg-surface2 hover:text-text active:bg-interactiveSoft',
        className
      )}
      {...props}
    />
  );
}
