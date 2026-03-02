import { useEffect } from 'react';
import { cn } from '../lib/utils';

type ToastProps = {
  message: string;
  open: boolean;
  onClose: () => void;
};

export default function Toast({ message, open, onClose }: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(onClose, 2200);
    return () => window.clearTimeout(id);
  }, [open, onClose]);

  return (
    <div
      className={cn(
        'fixed inset-x-4 bottom-4 z-[60] rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text shadow-elevate transition-all duration-calm ease-calm',
        open ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      )}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
