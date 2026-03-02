import { ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export default function Chip({ active = false, className, ...props }: ChipProps) {
  return (
    <button
      className={cn(
        'min-h-11 rounded-full px-4 text-sm font-medium shadow-soft transition-all duration-calm ease-calm',
        active ? 'bg-accent text-accentText' : 'bg-[color:var(--accentSoft)] text-muted hover:bg-surface hover:text-text',
        className
      )}
      {...props}
    />
  );
}
