import { expect, test } from "@playwright/test";
import { loginUser } from "./auth-utils";

test("login test", async ({ page }) => {
    test.setTimeout(600000);
    await loginUser(page);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(10000);
    await page.getByRole('button', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL(/^(?:https?:\/\/)?[^\/]*\/(?:[^\/]+\/)*dashboard(?:\/|$)/i);
});