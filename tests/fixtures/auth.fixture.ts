import { Page } from '@playwright/test';

/**
 * Authentication Helper
 * Reusable function to log in before tests
 */
export async function login(page: Page) {
  // Navigate to login page
  await page.goto('http://localhost:5173/login');

  // Fill credentials
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@agency1.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');

  // Click login button
  await page.getByRole('button', { name: 'LOGIN' }).click();

  // Wait for navigation to complete (wait for guards button to be visible)
  await page.getByRole('button', { name: 'Guards' }).waitFor({ state: 'visible', timeout: 15000 });
}

/**
 * Navigate to Guards page after login
 * Waits for data loading to complete
 */
export async function navigateToGuards(page: Page) {
  await page.getByRole('button', { name: 'Guards' }).click();

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // Wait for loading spinner to disappear (if present) with longer timeout
  const loadingText = page.getByText('Loading guards data...');

  try {
    const isLoading = await loadingText.isVisible({ timeout: 5000 }).catch(() => false);

    if (isLoading) {
      console.log('⏳ Waiting for guards data to load...');
      await loadingText.waitFor({ state: 'hidden', timeout: 45000 });
      console.log('✅ Loading complete');
    }
  } catch (error) {
    console.log('ℹ️ No loading indicator found (data may have loaded instantly)');
  }

  // Additional wait to ensure data is fresh (especially after guard creation)
  await page.waitForTimeout(2000);

  // Wait for either "Add New Guard" button OR check if guards table/content is visible
  try {
    await page.getByRole('button', { name: 'Add New Guard' })
      .waitFor({ state: 'visible', timeout: 15000 });
    console.log('✅ Guards page loaded - Add New Guard button visible');
  } catch (error) {
    // If button not found, check if we're still loading
    const stillLoading = await page.getByText('Loading').isVisible().catch(() => false);
    if (stillLoading) {
      throw new Error('Guards page still loading after timeout');
    }
    console.log('⚠️ Add New Guard button not found, but page appears loaded');
  }
}

/**
 * Navigate to Add New Guard page
 * Waits for the form to be ready
 */
export async function navigateToAddGuard(page: Page) {
  // Click Add New Guard button
  await page.getByRole('button', { name: 'Add New Guard' }).click();

  // Wait for form to load
  await page.getByText('Add PhotoMax size: 2MB').waitFor({ state: 'visible', timeout: 10000 });

  console.log('✅ Add New Guard form loaded');
}

/**
 * Check if guards exist in the table
 * Returns true if at least one guard is found
 */
export async function hasGuardsInTable(page: Page): Promise<boolean> {
  // Wait for table to load
  await page.waitForTimeout(5000);

  // Check if guards exist by looking for TableBody rows
  const tableBody = page.locator('tbody');
  const guardRows = tableBody.locator('tr');

  // Wait for at least one guard row to be visible
  return await guardRows.first().isVisible({ timeout: 10000 }).catch(() => false);
}

/**
 * Get guard rows from the table
 * Returns the locator for tbody tr elements
 */
export function getGuardRows(page: Page) {
  return page.locator('tbody tr');
}
