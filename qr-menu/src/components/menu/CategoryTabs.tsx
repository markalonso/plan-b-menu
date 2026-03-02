type CategoryTab = { id: string; label: string };

export default function CategoryTabs({
  tabs,
  active,
  onChange
}: {
  tabs: CategoryTab[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <nav aria-label="Menu categories">
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-0.5">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              aria-label={tab.label}
              aria-current={isActive ? 'true' : undefined}
              className={[
                'whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-300 ease-out',
                isActive
                  ? 'border-[var(--text)] bg-[var(--text)] text-[var(--bg)]'
                  : 'border-[var(--divider)] bg-transparent text-muted hover:border-[var(--text)]/30 hover:text-text'
              ].join(' ')}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
