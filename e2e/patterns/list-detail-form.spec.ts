import { expect, test } from '../fixtures/app';

test.describe('Developer patterns (mock API)', () => {
  test('list page sorts, searches and keeps state in the URL', async ({ page, gotoApp }) => {
    await gotoApp(page, '/_dev/patterns/list');

    await expect(page.getByRole('heading', { name: 'Sample records', level: 3 })).toBeVisible();
    await expect(page.getByText('SMP/2026/000001')).toBeVisible();

    await page.getByRole('columnheader', { name: /Name/ }).click();
    await expect(page).toHaveURL(/sort=name%3Aasc|sort=name:asc/);

    await page.getByRole('textbox', { name: 'Search', exact: true }).fill('record 57');
    await expect(page.getByText('SMP/2026/000057')).toBeVisible();
    await expect(page).toHaveURL(/search=record\+57|search=record%2057/);
    await expect(page.getByText(/1–1 of 1/)).toBeVisible();
  });

  test('record page shows workflow actions and runs a transition', async ({ page, gotoApp }) => {
    await gotoApp(page, '/_dev/patterns/records/rec-6');

    await expect(page.getByRole('heading', { name: 'SMP/2026/000006', level: 3 })).toBeVisible();
    const toolbar = page.getByRole('toolbar', { name: 'Document actions' });
    await toolbar.getByRole('button', { name: 'Submit for approval' }).click();

    await expect(page.getByText('Status updated')).toBeVisible();
    await expect(toolbar.getByRole('button', { name: 'Confirm' })).toBeVisible();
    await expect(page.getByText('Pending approval').first()).toBeVisible();
  });

  test('form page validates, saves with Ctrl+S and guards unsaved changes', async ({
    page,
    gotoApp,
    isMobile,
  }) => {
    test.skip(isMobile, 'Keyboard shortcut flow is desktop only');
    await gotoApp(page, '/_dev/patterns/records/new');

    await expect(page.getByRole('heading', { name: 'New sample record', level: 3 })).toBeVisible();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Code is required')).toBeVisible();

    await page.getByLabel(/^Code/).fill('E2E-1');
    await page.getByRole('link', { name: 'Dashboard' }).first().click();
    await expect(page.getByRole('dialog', { name: 'Discard unsaved changes?' })).toBeVisible();
    await page.getByRole('button', { name: 'Keep editing' }).click();
    await expect(page).toHaveURL(/records\/new$/);

    await page.getByLabel(/^Name/).fill('Created by Playwright');
    await page.getByLabel('Line 1 description').fill('First line');
    await page.getByLabel('Line 1 description').press('ControlOrMeta+s');

    await expect(page.getByRole('heading', { name: 'E2E-1', level: 3 })).toBeVisible();
    await expect(page).toHaveURL(/\/_dev\/patterns\/records\/rec-\d+$/);
  });

  test('server validation and concurrency conflicts are surfaced', async ({ page, gotoApp }) => {
    await gotoApp(page, '/_dev/patterns/records/rec-1/edit');

    await expect(page.getByRole('heading', { name: /Edit SMP/, level: 3 })).toBeVisible();
    await page.getByLabel(/^Code/).fill('CONFLICT');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('This record was changed by someone else')).toBeVisible();
    await page.getByRole('button', { name: 'Keep my changes' }).click();

    await page.getByLabel(/^Code/).fill('ERR');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('This code is reserved.')).toBeVisible();
  });
});
