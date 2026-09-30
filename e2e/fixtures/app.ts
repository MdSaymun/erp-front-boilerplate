import { expect, type Page, test as base } from '@playwright/test';

export interface AppFixtures {
  /** Opens the navigation (drawer on mobile, always visible on desktop) and returns it. */
  openNavigation: (page: Page) => Promise<ReturnType<Page['getByRole']>>;
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
});

export { expect };
