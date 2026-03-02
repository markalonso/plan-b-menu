import { PropsWithChildren, useEffect } from 'react';
import { cn } from '../lib/utils';

type BottomSheetProps = PropsWithChildren<{
  open: boolean;
  onClose: () => void;
  title?: string;
}>;

export default function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const titleId = title ? `sheet-title-${title.replace(/\s+/g, '-').toLowerCase()}` : undefined;

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <div
      className={cn('fixed inset-0 z-50 transition-opacity duration-calm ease-calm', open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0')}
      aria-hidden={!open}
    >
      <button className="absolute inset-0 bg-black/25 transition-opacity duration-calm ease-calm" onClick={onClose} aria-label="Close sheet" />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'absolute inset-x-0 bottom-0 rounded-t-3xl border border-border bg-surface p-5 shadow-elevate transition-transform duration-[220ms] ease-calm will-change-transform',
          open ? 'translate-y-0' : 'translate-y-full'
        )}
        style={{
          paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))',
          maxHeight: 'min(88dvh, 700px)'
        }}
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="mx-auto h-1.5 w-12 rounded-full bg-border" aria-hidden="true" />
          <button className="-me-2 min-h-11 min-w-11 rounded-full text-muted transition hover:bg-surface2 hover:text-text" onClick={onClose} aria-label="Close sheet">
            ✕
          </button>
        </div>
        {title ? (
          <h3 id={titleId} className="mb-2 text-xl font-bold text-text">
            {title}
          </h3>
        ) : null}
        <div className="no-scrollbar overflow-y-auto overscroll-contain" style={{ maxHeight: 'calc(min(88dvh, 700px) - 6.5rem)' }}>
          {children}
        </div>
      </section>
    </div>
  );
}
