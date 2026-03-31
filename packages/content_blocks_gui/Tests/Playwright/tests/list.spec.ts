import { test, expect } from '@playwright/test';
import { createAuthContext, openModule } from './helpers';

test.describe('List View', () => {
  test('module loads list component', async ({ browser }) => {
    const context = await createAuthContext(browser);
    const page = await context.newPage();
    const frame = await openModule(page);
    await expect(frame.locator('content-block-list')).toBeAttached({ timeout: 10000 });
    await context.close();
  });

  test('shows tab navigation', async ({ browser }) => {
    const context = await createAuthContext(browser);
    const page = await context.newPage();
    const frame = await openModule(page);
    await expect(frame.locator('.nav-tabs').first()).toBeVisible({ timeout: 10000 });
    await context.close();
  });
});
