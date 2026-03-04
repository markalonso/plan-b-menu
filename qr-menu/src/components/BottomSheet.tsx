import { PropsWithChildren, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/utils';

type BottomSheetProps = PropsWithChildren<{
  open: boolean;
  onClose: () => void;
  title?: string;
}>;

export default function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const titleId = useMemo(() => (title ? `sheet-title-${title.replace(/\s+/g, '-').toLowerCase()}` : undefined), [title]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={cn('fixed inset-0 z-[200] isolate transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]', open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0')}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet panel */}
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'absolute inset-x-0 bottom-0 z-10 mx-auto w-full max-w-3xl rounded-t-[28px] bg-surface shadow-elevate transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform',
          open ? 'translate-y-0' : 'translate-y-full'
        )}
        style={{
          paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))',
          maxHeight: 'min(90dvh, 800px)'
        }}
      >
        {/* Handle + close */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <div className="h-1 w-10 rounded-full bg-border" aria-hidden="true" />
          <button
            className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-full text-sm text-muted transition-all duration-200 hover:bg-surface2 hover:text-text"
            onClick={onClose}
            aria-label="Close sheet"
          >
            ✕
          </button>
        </div>

        {title ? (
          <h3 id={titleId} className="px-5 pb-3 font-heading text-2xl font-semibold text-text">
            {title}
          </h3>
        ) : null}

        <div className="no-scrollbar overflow-y-auto overscroll-contain px-5" style={{ maxHeight: 'calc(min(90dvh, 800px) - 7rem)' }}>
          {children}
        </div>
      </section>
    </div>,
    document.body
  );
}
