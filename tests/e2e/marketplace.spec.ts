import { expect, test, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

const submitTimeout = 75_000;

async function login(page: Page, role: "Buyer" | "Seller") {
  await page.goto("/login");
  await page.getByRole("button", { name: role }).click();
  await page.getByRole("button", { name: "Continue securely" }).click();
  await expect(page).toHaveURL(/dashboard/, { timeout: submitTimeout });
}

test("buyer can browse, filter, and open an opportunity", async ({ page }) => {
  await login(page, "Buyer");
  await page.goto("/marketplace");
  await expect(page.getByText("Find the")).toBeVisible();
  await page.getByLabel("Category").selectOption("FINTECH");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page).toHaveURL(/category=FINTECH/);
  const firstOpportunity = page.getByRole("link", { name: /View opportunity/ }).first();
  await expect(firstOpportunity).toBeVisible();
  await Promise.all([page.waitForURL(/\/assets\//, { timeout: submitTimeout }), firstOpportunity.click()]);
  await expect(page.getByText("Opportunity brief")).toBeVisible({ timeout: submitTimeout });
});

test("seller can create, edit, publish, and find an asset", async ({ page }) => {
  test.setTimeout(180_000);
  await login(page, "Seller");
  const title = `Northbridge E2E ${Date.now()}`;
  await page.goto("/seller/assets/new");
  await page.getByLabel("Asset title").fill(title);
  await page.getByLabel("Country").fill("Germany");
  await page.getByLabel("Asking price").fill("6800000");
  await page.getByLabel("Business overview").fill("A regulated payments platform with strong retention and clear room for a strategic owner.");
  await Promise.all([
    page.waitForURL(/\/seller\/assets$/, { timeout: submitTimeout }),
    page.getByRole("button", { name: "Save draft" }).click(),
  ]);
  await expect(page.getByText(title)).toBeVisible({ timeout: submitTimeout });
  await page.locator("article").filter({ hasText: title }).getByRole("link", { name: "Manage asset ↗" }).click();
  await page.getByLabel("Business overview").fill("An updated regulated payments platform with strong retention and clear room for a strategic owner.");
  await Promise.all([
    page.waitForURL(/\/seller\/assets$/, { timeout: submitTimeout }),
    page.getByRole("button", { name: "Save changes" }).click(),
  ]);
  const createdAsset = page.locator("article").filter({ hasText: title }).locator("xpath=..");
  const publishResponse = page.waitForResponse((response) => response.url().includes("/api/v1/assets/") && response.url().endsWith("/publish") && response.request().method() === "POST", { timeout: submitTimeout });
  await createdAsset.getByRole("button", { name: "Publish ↗" }).click();
  expect((await publishResponse).ok()).toBe(true);
  await expect(page.locator("article").filter({ hasText: title }).getByText("Published")).toBeVisible({ timeout: submitTimeout });
  await page.goto(`/marketplace?search=${encodeURIComponent(title)}`);
  await expect(page.getByText(title)).toBeVisible();
});

test("seller cannot modify another seller's asset", async ({ page }) => {
  await login(page, "Seller");
  const assetResponse = await page.request.get("/api/v1/assets/circuit-remit");
  const assetPayload = await assetResponse.json() as { data: { id: string; title: string; category: string; country: string; description: string; askingPrice: string; currency: string; revenue: string | null; ebitda: string | null; dealType: string; businessStatus: string } };
  const response = await page.request.patch(`/api/v1/assets/${assetPayload.data.id}`, { data: { ...assetPayload.data, title: "Unauthorized update" } });
  expect(response.status()).toBe(404);
});

test("buyer preferences persist after refresh", async ({ page }) => {
  await login(page, "Buyer");
  await page.goto("/buyer/profile");
  const companyInput = page.getByLabel("Company");
  await companyInput.fill("");
  await expect(companyInput).toHaveValue("");
  await companyInput.fill("Northline Capital E2E");
  const saveResponse = page.waitForResponse((response) => response.url().endsWith("/api/v1/buyer/profile") && response.request().method() === "PATCH", { timeout: submitTimeout });
  await page.getByRole("button", { name: "Save criteria" }).click();
  expect((await saveResponse).ok()).toBe(true);
  await expect(page.getByRole("status")).toContainText("saved", { timeout: submitTimeout });
  await page.reload();
  await expect(companyInput).toHaveValue("Northline Capital E2E");
});
