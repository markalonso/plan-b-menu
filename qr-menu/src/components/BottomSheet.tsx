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
      className={cn(
        'fixed inset-0 z-[100] flex items-end justify-center transition-opacity duration-300 ease-out sm:items-center',
        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      )}
      aria-hidden={!open}
    >
      {/* Backdrop — soft dark veil, no harsh blur */}
      <button
        className="absolute inset-0 bg-[#110e0a]/50"
        style={{ transition: 'opacity 300ms ease' }}
        onClick={onClose}
        aria-label="Close sheet"
        tabIndex={-1}
      />

      {/* Panel — slides up on mobile, scales in on desktop */}
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'relative z-10 w-full bg-[var(--surface)] shadow-[var(--shadow-overlay)]',
          'rounded-t-[var(--r-3xl)] sm:rounded-[var(--r-3xl)]',
          'sm:mx-4 sm:w-full sm:max-w-lg',
          'transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform',
          open ? 'translate-y-0 sm:scale-100' : 'translate-y-full sm:translate-y-0 sm:scale-95'
        )}
        style={{
          paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
          maxHeight: 'min(92dvh, 780px)'
        }}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden" aria-hidden="true">
          <div className="h-1 w-10 rounded-full bg-[var(--border)]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-6 py-4">
          {title ? (
            <h3 id={titleId} className="font-heading text-xl font-semibold text-text">
              {title}
            </h3>
          ) : (
            <span />
          )}
          <button
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-surface2 hover:text-text"
            onClick={onClose}
            aria-label="Close sheet"
          >
            ✕
          </button>
        </div>

        {/* Thin divider */}
        <div className="h-px bg-[var(--border)]" aria-hidden="true" />

        {/* Scrollable content */}
        <div
          className="no-scrollbar overflow-y-auto overscroll-contain px-6 pt-5"
          style={{ maxHeight: 'calc(min(92dvh, 780px) - 7rem)' }}
        >
          {children}
        </div>
      </section>
    </div>,
    document.body
  );
}
