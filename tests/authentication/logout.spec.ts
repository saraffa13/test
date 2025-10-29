import { expect, test } from "@playwright/test";
import { loginUser, logoutUser } from "./auth-utils";

test.describe('Authentication Tests', () => {

    test.beforeEach(async ({ page }) => {
        await loginUser(page);
        await page.waitForLoadState('networkidle');
        await page.getByRole('button', { name: 'Dashboard' }).click();
        await expect(page).toHaveURL(/^(?:https?:\/\/)?[^\/]*\/(?:[^\/]+\/)*dashboard(?:\/|$)/i);
    });

    test("logout test", async ({ page }) => {
        await logoutUser(page);
        await expect(page).not.toHaveURL(/dashboard/); 
        await expect(page.getByRole('button', { name: 'Dashboard' })).toBeHidden();
    });
});