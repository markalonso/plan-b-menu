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
    <div className="no-scrollbar flex gap-2 overflow-x-auto rounded-2xl bg-[rgba(255,255,255,0.66)] p-2 shadow-soft">
      {tabs.map((tab) => (
        <Chip key={tab.id} active={active === tab.id} onClick={() => onChange(tab.id)} aria-label={tab.label} className="shrink-0">
          {tab.label}
        </Chip>
      ))}
    </div>
  );
}
