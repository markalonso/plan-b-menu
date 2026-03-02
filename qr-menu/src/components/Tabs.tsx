import Chip from './Chip';
import { cn } from '../lib/utils';

type TabsProps = {
  items: string[];
  value: string;
  onChange: (value: string) => void;
  sticky?: boolean;
};

export default function Tabs({ items, value, onChange, sticky = false }: TabsProps) {
  return (
    <div className={cn(sticky && 'sticky top-0 z-20 -mx-4 bg-bg/90 px-4 py-2 backdrop-blur-sm')}>
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {items.map((item) => (
          <Chip key={item} active={item === value} onClick={() => onChange(item)}>
            {item}
          </Chip>
        ))}
      </div>
    </div>
  );
}
