import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'min-h-11 w-full rounded-full border border-inputBorder bg-inputBg px-4 text-base text-text placeholder:text-muted outline-none transition-all duration-calm ease-calm hover:border-inputBorderHover focus:border-inputBorderFocus focus:ring-2 focus:ring-[color:var(--primary-focus-ring)]',
        className
      )}
      {...props}
    />
  );
});

export default Input;
