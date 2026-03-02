import { ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

export default function Button({ className, variant = 'primary', ...props }: Props) {
  return (
    <button
      className={cn(
        'inline-flex min-h-11 items-center justify-center rounded-full px-5 text-[0.95rem] font-semibold transition-all duration-calm ease-calm active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-accent text-accentText shadow-soft hover:-translate-y-0.5 hover:brightness-[0.98]',
        variant === 'secondary' && 'bg-[color:var(--accentSoft)] text-text shadow-soft hover:-translate-y-0.5 hover:brightness-[0.99]',
        variant === 'ghost' && 'bg-transparent text-muted hover:bg-surface2 hover:text-text',
        className
      )}
      {...props}
    />
  );
}
