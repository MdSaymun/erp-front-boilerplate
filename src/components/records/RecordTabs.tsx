import { Tabs, type TabsProps } from 'antd';
import { useSearchParams } from 'react-router';

interface RecordTabsProps {
  items: NonNullable<TabsProps['items']>;
  /** URL param name (default `tab`). */
  paramName?: string;
}

/** Detail-page tabs whose active key lives in the URL (`?tab=lines`). */
export function RecordTabs({ items, paramName = 'tab' }: RecordTabsProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const first = items[0]?.key;
  const active = searchParams.get(paramName) ?? first;

  return (
    <Tabs
      items={items}
      activeKey={active}
      onChange={(key) =>
        setSearchParams(
          (previous) => {
            const next = new URLSearchParams(previous);
            if (key === first) next.delete(paramName);
            else next.set(paramName, key);
            return next;
          },
          { replace: true },
        )
      }
    />
  );
}
