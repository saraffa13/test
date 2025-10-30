import { Page } from "@playwright/test";

export async function loginUser(page: Page, email: string = "admin1@upandup.com", password: string = "Password@123") {
  // await page.goto("http://localhost:5173/login");
  await page.goto("https://main.dlsxzkf1thczu.amplifyapp.com");
  await page.getByRole("textbox", { name: "Email" }).click();
  await page.getByRole("textbox", { name: "Email" }).fill(email);
  await page.getByRole("textbox", { name: "Email" }).press("Tab");
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "LOGIN" }).click();
}

export async function logoutUser(page: Page) {
  await page.getByRole("button", { name: "account of current user" }).click();
  await page.getByRole("menuitem", { name: "Logout" }).click();
}
