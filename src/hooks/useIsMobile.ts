import { Grid } from 'antd';

import { APP_SHELL } from '@/constants/app';

/** True below the shell's mobile breakpoint (sidebar becomes a drawer). */
export function useIsMobile(): boolean {
  const screens = Grid.useBreakpoint();
  const value = screens[APP_SHELL.mobileBreakpoint];
  // Until the breakpoint observer reports, assume desktop to avoid layout flashes.
  return value === undefined ? false : !value;
}
