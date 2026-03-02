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
    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
      {tabs.map((tab) => (
        <Chip key={tab.id} active={active === tab.id} onClick={() => onChange(tab.id)} aria-label={tab.label}>
          {tab.label}
        </Chip>
      ))}
    </div>
  );
}
