import { useMemo, useState } from 'react';
import BottomSheet from '../BottomSheet';
import Chip from '../Chip';

type CategoryTab = { id: string; label: string };

export default function CategoryTabs({
  tabs,
  active,
  onChange,
  maxVisibleTabs = 9,
  moreLabel = 'More',
  allCategoriesTitle = 'All categories'
}: {
  tabs: CategoryTab[];
  active: string;
  onChange: (id: string) => void;
  maxVisibleTabs?: number;
  moreLabel?: string;
  allCategoriesTitle?: string;
}) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const hasOverflow = tabs.length > maxVisibleTabs;
  const visibleTabs = useMemo(() => tabs.slice(0, maxVisibleTabs), [tabs, maxVisibleTabs]);
  const hiddenTabs = useMemo(() => tabs.slice(maxVisibleTabs), [tabs, maxVisibleTabs]);
  const isActiveHidden = hiddenTabs.some((tab) => tab.id === active);

  return (
    <>
      <div className="rounded-2xl border border-border/60 bg-tabbar p-1.5 shadow-soft backdrop-blur-sm">
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {visibleTabs.map((tab) => (
            <Chip
              key={tab.id}
              active={active === tab.id}
              onClick={() => onChange(tab.id)}
              aria-label={tab.label}
              className="w-full min-w-0 justify-center truncate whitespace-nowrap px-3"
            >
              {tab.label}
            </Chip>
          ))}

          {hasOverflow ? (
            <Chip
              active={isActiveHidden}
              onClick={() => setIsMoreOpen(true)}
              aria-label={moreLabel}
              className="w-full min-w-0 justify-center truncate whitespace-nowrap px-3"
            >
              {moreLabel}
            </Chip>
          ) : null}
        </div>
      </div>

      <BottomSheet open={isMoreOpen} onClose={() => setIsMoreOpen(false)} title={allCategoriesTitle}>
        <div className="space-y-3 pb-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {tabs.map((tab) => (
              <Chip
                key={`sheet-${tab.id}`}
                active={active === tab.id}
                onClick={() => {
                  onChange(tab.id);
                  setIsMoreOpen(false);
                }}
                aria-label={tab.label}
                className="w-full min-w-0 justify-center truncate whitespace-nowrap"
              >
                {tab.label}
              </Chip>
            ))}
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
