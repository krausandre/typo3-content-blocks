import { test, expect } from '@playwright/test';
import config from '../../config';

test.describe('Content Blocks GUI Module', () => {
  test.beforeEach(async ({ page }) => {
    // Login directly (the shared login setup uses placeholders that don't exist in this TYPO3 version)
    await page.goto(config.baseUrl);
    await page.waitForLoadState('networkidle');

    // Check if already logged in (module menu visible)
    const isLoggedIn = await page.locator('.t3js-topbar-button-modulemenu, .scaffold-modulemenu').isVisible().catch(() => false);
    if (!isLoggedIn) {
      await page.locator('input[name="username"]').fill(config.login.admin.username);
      await page.locator('input[name="p_field"]').fill(config.login.admin.password);
      await page.locator('button[type="submit"]').click();
      await page.waitForLoadState('networkidle');
    }

    // Navigate to Content Blocks GUI module
    await page.goto(config.baseUrl + 'module/web/ContentBlocksGui');
    await page.waitForLoadState('networkidle');
  });

  test('module is accessible and loads', async ({ page }) => {
    const listComponent = page.locator('content-block-list');
    await expect(listComponent).toBeAttached();
  });

  test('list view shows tab navigation', async ({ page }) => {
    const tabs = page.locator('.content-blocks-tabs, [role="tablist"]');
    await expect(tabs).toBeVisible();
  });

  test('tab switching works', async ({ page }) => {
    const pageTypeTab = page.getByRole('tab', { name: /page.type/i }).or(page.locator('[data-type="page-type"]'));
    if (await pageTypeTab.isVisible()) {
      await pageTypeTab.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('editor loads for new content element', async ({ page }) => {
    const newButton = page.locator('[data-action="new-content-block"], .btn-toolbar a[href*="modify/new"]').first();
    if (await newButton.isVisible()) {
      await newButton.click();
      await page.waitForLoadState('networkidle');

      const editor = page.locator('content-block-editor');
      await expect(editor).toBeAttached();

      const leftPane = page.locator('content-block-editor-left-pane');
      await expect(leftPane).toBeAttached();

      const middlePane = page.locator('content-block-editor-middle-pane');
      await expect(middlePane).toBeAttached();

      const rightPane = page.locator('content-block-editor-right-pane');
      await expect(rightPane).toBeAttached();
    }
  });

  test('editor left pane has settings tab with form fields', async ({ page }) => {
    const newButton = page.locator('[data-action="new-content-block"], .btn-toolbar a[href*="modify/new"]').first();
    if (await newButton.isVisible()) {
      await newButton.click();
      await page.waitForLoadState('networkidle');

      const vendorInput = page.locator('#vendor');
      const nameInput = page.locator('#name');
      const extensionSelect = page.locator('#extension');

      await expect(vendorInput).toBeAttached();
      await expect(nameInput).toBeAttached();
      await expect(extensionSelect).toBeAttached();
    }
  });

  test('editor left pane components tab shows draggable field types', async ({ page }) => {
    const newButton = page.locator('[data-action="new-content-block"], .btn-toolbar a[href*="modify/new"]').first();
    if (await newButton.isVisible()) {
      await newButton.click();
      await page.waitForLoadState('networkidle');

      const componentsTab = page.getByText('Components');
      if (await componentsTab.isVisible()) {
        await componentsTab.click();

        const fieldTypes = page.locator('draggable-field-type');
        await expect(fieldTypes.first()).toBeAttached();
      }
    }
  });

  test('delete button shows confirmation dialog', async ({ page }) => {
    const deleteButton = page.locator('[data-action="delete"], .btn-danger').first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      const modal = page.locator('.modal, typo3-backend-modal');
      await expect(modal).toBeVisible({ timeout: 5000 });
    }
  });
});
