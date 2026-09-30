import { expect, test } from '../fixtures/app';

test.describe('Application shell smoke', () => {
  test('application opens and lands on the dashboard', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page).toHaveTitle('Inventory SaaS');
  });

  test('application shell renders header and content', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByTestId('app-shell')).toBeVisible();
    await expect(page.getByRole('banner').or(page.locator('header')).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /User menu/ })).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('sidebar navigation renders', async ({ page, isMobile, openNavigation }) => {
    await page.goto('/dashboard');

    if (isMobile) {
      await expect(page.getByTestId('app-sider')).toHaveCount(0);
    } else {
      await expect(page.getByTestId('app-sider')).toBeVisible();
    }

    const nav = await openNavigation(page);
    await expect(nav.getByText('Dashboard')).toBeVisible();
    await expect(nav.getByText('Inventory')).toBeVisible();
    await expect(nav.getByText('Accounting')).toBeVisible();
  });

  test('dashboard route shows placeholder KPIs', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByRole('heading', { name: 'Dashboard', level: 3 })).toBeVisible();
    await expect(page.getByText('Total Products')).toBeVisible();
    await expect(page.getByText('Demo data').first()).toBeVisible();
  });

  test('placeholder navigation works and shows breadcrumbs', async ({ page, openNavigation }) => {
    await page.goto('/dashboard');

    let nav = await openNavigation(page);
    await nav.getByText('Sales').click();
    await nav.getByText('Quotations').click();

    await expect(page).toHaveURL(/\/sales\/quotations$/);
    await expect(page.getByRole('heading', { name: 'Sales · Quotations', level: 3 })).toBeVisible();
    await expect(page.getByLabel('Breadcrumb')).toContainText('Sales');

    nav = await openNavigation(page);
    await nav.getByText('Settings').click();

    await expect(page).toHaveURL(/\/settings$/);
    await expect(page.getByRole('heading', { name: 'Settings', level: 3 })).toBeVisible();
    await expect(
      page.getByRole('form', { name: 'Company profile demonstration form' }),
    ).toBeVisible();
  });

  test('unknown routes show the not-found page', async ({ page }) => {
    await page.goto('/does-not-exist');

    await expect(page.getByText('Page not found')).toBeVisible();
    await page.getByRole('button', { name: 'Go to dashboard' }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
