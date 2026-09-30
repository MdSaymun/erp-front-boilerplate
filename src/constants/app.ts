export const APP_SHELL = {
  siderWidth: 240,
  siderCollapsedWidth: 64,
  headerHeight: 56,
  /** Ant Design breakpoint below which the sidebar becomes a drawer. */
  mobileBreakpoint: 'lg',
} as const;

export const HTTP = {
  /** Default request timeout in milliseconds. */
  timeoutMs: 30_000,
} as const;
