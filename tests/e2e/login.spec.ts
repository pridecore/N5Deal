import { expect, test } from "@playwright/test";

const submitTimeout = 75_000;

test("buyer can enter the protected workspace", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Buyer" }).click();
  await page.getByRole("button", { name: "Continue securely" }).click();
  await expect(page).toHaveURL(/dashboard/, { timeout: submitTimeout });
  await expect(page.getByText("Buyer workspace")).toBeVisible();
});
