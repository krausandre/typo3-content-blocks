import { test, expect } from '@playwright/test';
import { config, authFile } from './helpers';

test('login and save session', async ({ browser }) => {
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();
  await page.goto(config.baseUrl + 'login');
  await page.waitForLoadState('networkidle');
  await page.locator('input[name="username"]').fill(config.login.admin.username);
  await page.locator('input[name="p_field"]').fill(config.login.admin.password);
  await page.locator('button[type="submit"]').click();
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.scaffold')).toBeAttached({ timeout: 10000 });
  await context.storageState({ path: authFile });
  await context.close();
});
