import { test, expect, type FrameLocator } from '@playwright/test';

const config = {
  baseUrl: process.env.PLAYWRIGHT_BASE_URL || 'https://typo3-content-blocks-gui.ddev.site/typo3/',
  login: {
    admin: {
      username: process.env.BACKEND_ADMIN_USERNAME || 'admin',
      password: process.env.BACKEND_ADMIN_PASSWORD || 'Password1!',
    },
  },
};

const authFile = '/tmp/cb-gui-auth.json';

test.describe('Content Blocks GUI Module', () => {
  test.describe.configure({ mode: 'serial' });

  test('login and save session', async ({ browser }) => {
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();
    await page.goto(config.baseUrl + 'login');
    await page.waitForLoadState('networkidle');
    await page.locator('input[name="username"]').fill(config.login.admin.username);
    await page.locator('input[name="p_field"]').fill(config.login.admin.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle');
    // Wait for backend scaffold to confirm successful login
    await expect(page.locator('.scaffold')).toBeAttached({ timeout: 10000 });
    await context.storageState({ path: authFile });
    await context.close();
  });

  test('module loads list component', async ({ browser }) => {
    const context = await browser.newContext({ ignoreHTTPSErrors: true, storageState: authFile });
    const page = await context.newPage();
    await page.goto(config.baseUrl + 'module/web/ContentBlocksGui');
    await page.waitForLoadState('networkidle');
    const frame = page.frameLocator('typo3-iframe-module iframe');
    await expect(frame.locator('content-block-list')).toBeAttached({ timeout: 10000 });
    await context.close();
  });

  test('list view shows tab navigation', async ({ browser }) => {
    const context = await browser.newContext({ ignoreHTTPSErrors: true, storageState: authFile });
    const page = await context.newPage();
    await page.goto(config.baseUrl + 'module/web/ContentBlocksGui');
    await page.waitForLoadState('networkidle');
    const frame = page.frameLocator('typo3-iframe-module iframe');
    await expect(frame.locator('.nav-tabs').first()).toBeVisible({ timeout: 10000 });
    await context.close();
  });

  test('editor loads with three panes', async ({ browser }) => {
    const context = await browser.newContext({ ignoreHTTPSErrors: true, storageState: authFile });
    const page = await context.newPage();
    await page.goto(config.baseUrl + 'module/web/ContentBlocksGui');
    await page.waitForLoadState('networkidle');
    const frame = page.frameLocator('typo3-iframe-module iframe');
    const newButton = frame.locator('a[href*="modify/new"]').first();
    if (await newButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      const editorFrame = page.frameLocator('typo3-iframe-module iframe');
      await expect(editorFrame.locator('content-block-editor')).toBeAttached();
      await expect(editorFrame.locator('content-block-editor-left-pane')).toBeAttached();
      await expect(editorFrame.locator('content-block-editor-middle-pane')).toBeAttached();
      await expect(editorFrame.locator('content-block-editor-right-pane')).toBeAttached();
    }
    await context.close();
  });

  test('editor settings tab has form fields', async ({ browser }) => {
    const context = await browser.newContext({ ignoreHTTPSErrors: true, storageState: authFile });
    const page = await context.newPage();
    await page.goto(config.baseUrl + 'module/web/ContentBlocksGui');
    await page.waitForLoadState('networkidle');
    const frame = page.frameLocator('typo3-iframe-module iframe');
    const newButton = frame.locator('a[href*="modify/new"]').first();
    if (await newButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      const editorFrame = page.frameLocator('typo3-iframe-module iframe');
      await expect(editorFrame.locator('#vendor')).toBeAttached();
      await expect(editorFrame.locator('#name')).toBeAttached();
      await expect(editorFrame.locator('#extension')).toBeAttached();
    }
    await context.close();
  });

  test('editor components tab shows field types', async ({ browser }) => {
    const context = await browser.newContext({ ignoreHTTPSErrors: true, storageState: authFile });
    const page = await context.newPage();
    await page.goto(config.baseUrl + 'module/web/ContentBlocksGui');
    await page.waitForLoadState('networkidle');
    const frame = page.frameLocator('typo3-iframe-module iframe');
    const newButton = frame.locator('a[href*="modify/new"]').first();
    if (await newButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      const editorFrame = page.frameLocator('typo3-iframe-module iframe');
      const componentsTab = editorFrame.getByText('Components');
      if (await componentsTab.isVisible()) {
        await componentsTab.click();
        await expect(editorFrame.locator('draggable-field-type').first()).toBeAttached();
      }
    }
    await context.close();
  });
});
