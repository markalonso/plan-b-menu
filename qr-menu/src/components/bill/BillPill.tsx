import { createPortal } from 'react-dom';

export default function BillPill({
  count,
  summary,
  onOpen,
  label,
  ariaLabel
}: {
  count: number;
  summary: string;
  onOpen: () => void;
  label: string;
  ariaLabel: string;
}) {
  if (typeof document === 'undefined' || count <= 0) return null;

  return createPortal(
    <button
      onClick={onOpen}
      className="fixed end-4 z-40 inline-flex min-h-12 items-center gap-3 rounded-full bg-primary px-4 py-2.5 text-primaryText shadow-elevate transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-primaryHover active:scale-[0.97] active:bg-primaryActive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary-focus-ring)] focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:transform-none"
      style={{ bottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
      aria-label={ariaLabel}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="truncate text-sm font-semibold">{label}</span>
        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-white/20 bg-white/15 px-2 text-xs font-semibold tabular-nums">
          {count}
        </span>
      </span>
      <span className="h-5 w-px shrink-0 bg-white/25" aria-hidden="true" />
      <span className="text-sm font-semibold tabular-nums">{summary}</span>
    </button>,
    document.body
  );
}
