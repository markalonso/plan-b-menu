import { createPortal } from 'react-dom';

export default function BillPill({
  count,
  onOpen,
  label,
  ariaLabel
}: {
  count: number;
  onOpen: () => void;
  label: string;
  ariaLabel: string;
}) {
  if (typeof document === 'undefined' || count <= 0) return null;

  return createPortal(
    <button
      onClick={onOpen}
      className="fixed end-4 z-40 inline-flex min-h-12 items-center gap-2.5 rounded-full bg-primary px-5 py-2.5 font-semibold text-primaryText shadow-elevate transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-primaryHover active:scale-[0.97] active:bg-primaryActive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary-focus-ring)] focus-visible:ring-offset-2"
      style={{ bottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
      aria-label={ariaLabel}
    >
      <span>{label}</span>
      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-white/25 px-2 text-sm font-bold">{count}</span>
    </button>,
    document.body
  );
}
