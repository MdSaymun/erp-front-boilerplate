import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

// Ant Design's responsive observer and our theme hook rely on matchMedia.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('min-width') && !query.includes('max-width'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// jsdom does not implement layout APIs used by antd Table/Menu.
if (typeof window !== 'undefined') {
  window.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;

  Object.defineProperty(window, 'getComputedStyle', {
    value: (element: Element) => ({
      ...({} as CSSStyleDeclaration),
      getPropertyValue: () => '',
      // antd reads these when measuring inputs.
      paddingLeft: '0px',
      paddingRight: '0px',
      borderLeftWidth: '0px',
      borderRightWidth: '0px',
      boxSizing: 'border-box',
      display: element instanceof HTMLElement ? 'block' : '',
    }),
  });
}
