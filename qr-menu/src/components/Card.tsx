import { PropsWithChildren } from 'react';
import { cn } from '../lib/utils';

export default function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <article className={cn('rounded-2xl bg-surface p-5 shadow-soft', className)}>{children}</article>;
}
