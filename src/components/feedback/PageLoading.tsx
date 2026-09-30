import { Flex, Spin } from 'antd';

interface PageLoadingProps {
  /** Screen-reader text; keep it meaningful ("Loading products"). */
  label?: string;
  minHeight?: number | string;
}

export function PageLoading({ label = 'Loading', minHeight = 240 }: PageLoadingProps) {
  return (
    <Flex align="center" justify="center" style={{ minHeight }} role="status" aria-live="polite">
      <Spin size="large" />
      <span
        className="sr-only"
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}
      >
        {label}
      </span>
    </Flex>
  );
}
