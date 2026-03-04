import Chip from '../Chip';

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
    <div className="no-scrollbar flex gap-1.5 overflow-x-auto rounded-2xl bg-surface/80 p-1.5 shadow-soft backdrop-blur-sm">
      {tabs.map((tab) => (
        <Chip key={tab.id} active={active === tab.id} onClick={() => onChange(tab.id)} aria-label={tab.label} className="shrink-0">
          {tab.label}
        </Chip>
      ))}
    </div>
  );
}
