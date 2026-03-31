import { type Browser, type Page, expect } from '@playwright/test';
import * as path from 'path';

export const config = {
  baseUrl: process.env.PLAYWRIGHT_BASE_URL || '',
  login: {
    admin: {
      username: process.env.BACKEND_ADMIN_USERNAME || '',
      password: process.env.BACKEND_ADMIN_PASSWORD || '',
    },
  },
};

export const authFile = path.join(__dirname, '..', 'auth.json');

/**
 * Create a browser context with stored auth session.
 */
export async function createAuthContext(browser: Browser) {
  return browser.newContext({ ignoreHTTPSErrors: true, storageState: authFile });
}

/**
 * Navigate to the Content Blocks GUI module and return the iframe FrameLocator.
 */
export async function openModule(page: Page) {
  await page.goto(config.baseUrl + 'module/web/ContentBlocksGui');
  await page.waitForLoadState('networkidle');
  return page.frameLocator('typo3-iframe-module iframe');
}

/**
 * Navigate to the editor for a new Content Element.
 * Returns the iframe FrameLocator pointing to the editor, or null if the button was not found.
 */
export async function openNewEditor(page: Page) {
  const frame = await openModule(page);
  const newButton = frame.locator('a[href*="modify/new"]').first();
  if (!(await newButton.isVisible({ timeout: 5000 }).catch(() => false))) {
    return null;
  }
  await newButton.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  return page.frameLocator('typo3-iframe-module iframe');
}

/**
 * Programmatic field drop on a dropzone-field inside an iframe.
 * Calls the dropzone's internal method directly since browsers block
 * DataTransfer on programmatically created DragEvents.
 */
export async function dropFieldType(page: Page, type: string, identifier: string): Promise<boolean> {
  const iframeEl = await page.locator('typo3-iframe-module iframe').elementHandle();
  if (!iframeEl) return false;
  const frame = await iframeEl.contentFrame();
  if (!frame) return false;
  return frame.evaluate(({ t, id }) => {
    const dropzone = document.querySelector('dropzone-field') as any;
    if (!dropzone || !dropzone._dispatchFieldTypeDroppedEvent) return false;
    dropzone._dispatchFieldTypeDroppedEvent(JSON.stringify({ type: t, identifier: id }));
    return true;
  }, { t: type, id: identifier });
}
