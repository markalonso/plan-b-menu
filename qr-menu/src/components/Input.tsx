import { InputHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

export default function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'min-h-11 w-full rounded-full border border-border bg-surface px-4 text-base text-text placeholder:text-muted outline-none transition-all duration-calm ease-calm focus:border-accent/45 focus:ring-2 focus:ring-accent/15',
        className
      )}
      {...props}
    />
  );
}
