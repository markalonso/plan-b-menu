import { ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export default function Chip({ active = false, className, ...props }: ChipProps) {
  return (
    <button
      className={cn(
        'min-h-11 rounded-full border px-4 text-sm font-medium transition-all duration-calm ease-calm',
        active ? 'border-accent bg-accent text-accentText' : 'border-border bg-surface text-muted hover:text-text',
        className
      )}
      {...props}
    />
  );
}
