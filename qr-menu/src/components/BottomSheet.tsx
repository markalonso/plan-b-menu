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

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={cn('fixed inset-0 z-[200] isolate transition-opacity duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none', open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0')}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 w-full bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close sheet"
        tabIndex={-1}
      />

      {/* Sheet panel */}
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'absolute inset-x-0 bottom-0 z-10 mx-auto w-full max-w-3xl rounded-t-[28px] bg-surface shadow-elevate transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none',
          open ? 'translate-y-0' : 'translate-y-full'
        )}
        style={{
          paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))',
          maxHeight: 'min(90dvh, 800px)'
        }}
      >
        {/* Handle + close */}
        <div className="relative flex items-center justify-center pt-3 pb-2">
          <div className="h-1 w-10 rounded-full bg-border" aria-hidden="true" />
          <button
            className="absolute end-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm text-muted transition-all duration-200 hover:bg-surface2 hover:text-text active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary-focus-ring)] motion-reduce:transition-none motion-reduce:transform-none"
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
