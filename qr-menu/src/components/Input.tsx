import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'min-h-11 w-full rounded-full border border-border/70 bg-surface px-4 text-base text-text placeholder:text-muted outline-none transition-all duration-calm ease-calm focus:border-accent/40 focus:ring-2 focus:ring-accent/10',
        className
      )}
      {...props}
    />
  );
});

export default Input;
