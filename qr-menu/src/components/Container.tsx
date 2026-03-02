import { PropsWithChildren } from 'react';
import { cn } from '../lib/utils';

export default function Container({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn('mx-auto w-full max-w-md px-4 sm:px-5', className)}>{children}</div>;
}
