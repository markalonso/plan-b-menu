import { cn } from '../lib/utils';

export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-2xl bg-gradient-to-r from-surface2 via-surface to-surface2 bg-[length:200%_100%] shadow-soft',
        className
      )}
    />
  );
}
