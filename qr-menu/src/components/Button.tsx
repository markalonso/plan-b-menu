import { ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

export default function Button({ className, variant = 'primary', ...props }: Props) {
  return (
    <button
      className={cn(
        'inline-flex min-h-11 items-center justify-center rounded-2xl px-5 text-[0.95rem] font-semibold transition-all duration-calm ease-calm active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'primary' && 'bg-accent text-accentText shadow-soft hover:brightness-[0.97]',
        variant === 'secondary' && 'border border-border bg-surface text-text shadow-soft hover:bg-surface2',
        variant === 'ghost' && 'bg-transparent text-muted hover:bg-surface2 hover:text-text',
        className
      )}
      {...props}
    />
  );
}
