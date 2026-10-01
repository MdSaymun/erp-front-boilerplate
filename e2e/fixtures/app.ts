import { expect, type Page, test as base } from '@playwright/test';

export interface AppFixtures {
  /** Opens the navigation (drawer on mobile, always visible on desktop) and returns it. */
  openNavigation: (page: Page) => Promise<ReturnType<Page['getByRole']>>;
  /** Navigates and waits for the mock API worker to be ready. */
  gotoApp: (page: Page, path: string) => Promise<void>;
}

/**
 * Uses Playwright's built-in `isMobile` option (true for the Pixel 7 project) to decide
 * whether navigation lives in a drawer.
 */
export const test = base.extend<AppFixtures>({
  openNavigation: async ({ isMobile }, use) => {
    await use(async (page: Page) => {
      if (isMobile) {
        await page.getByRole('button', { name: 'Open navigation' }).click();
        await expect(page.getByRole('dialog')).toBeVisible();
      }
      const nav = page.getByRole('navigation', { name: 'Main navigation' });
      await expect(nav).toBeVisible();
      return nav;
    });
  },
  // eslint-disable-next-line no-empty-pattern -- Playwright requires the destructuring form
  gotoApp: async ({}, use) => {
    await use(async (page: Page, path: string) => {
      await page.goto(path);
      await page.waitForFunction(
        () => (window as Window & { __mswReady?: boolean }).__mswReady === true,
      );
    });
  },
});

export { expect };
