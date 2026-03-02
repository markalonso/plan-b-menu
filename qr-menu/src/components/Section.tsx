import { PropsWithChildren } from 'react';
import { cn } from '../lib/utils';

type SectionProps = PropsWithChildren<{
  title?: string;
  eyebrow?: string;
  className?: string;
}>;

export default function Section({ title, eyebrow, className, children }: SectionProps) {
  return (
    <section className={cn('space-y-4 py-4', className)}>
      {(title || eyebrow) && (
        <header className="space-y-1">
          {eyebrow ? <p className="text-sm font-medium text-muted">{eyebrow}</p> : null}
          {title ? <h2 className="text-2xl font-bold tracking-tight text-text">{title}</h2> : null}
        </header>
      )}
      {children}
    </section>
  );
}
