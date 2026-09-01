import { expect, test, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

const submitTimeout = 75_000;

async function login(page: Page, role: "Buyer" | "Seller" | "Manager") {
  await page.goto("/login");
  await page.getByRole("button", { name: role }).click();
  await page.getByRole("button", { name: "Continue securely" }).click();
  await expect(page).toHaveURL(/dashboard/, { timeout: submitTimeout });
}

test("buyer sees match scores, sorts by best match, contacts seller, and conversation persists", async ({ page }) => {
  await login(page, "Buyer");
  const reply = `Following up with one more diligence question ${Date.now()}.`;
  await page.goto("/marketplace");
  await expect(page.locator("article").filter({ hasText: /match/i }).first()).toBeVisible();
  await page.getByLabel("Sort by").selectOption("best-match");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page).toHaveURL(/sort=best-match/);
  await Promise.all([
    page.waitForURL(/\/assets\//, { timeout: submitTimeout }),
    page.getByRole("link", { name: /View asset/ }).first().click(),
  ]);
  await expect(page.getByText("Opportunity brief")).toBeVisible({ timeout: submitTimeout });
  await page.getByLabel("Private message").fill("I would like to discuss this acquisition opportunity.");
  await page.getByRole("button", { name: "Contact seller" }).click();
  await expect(page).toHaveURL(/messages\/.+/, { timeout: submitTimeout });
  await page.getByLabel("Reply to thread").fill(reply);
  const replyResponse = page.waitForResponse((response) => response.url().includes("/api/v1/conversations/") && response.url().endsWith("/messages") && response.request().method() === "POST");
  await page.getByRole("button", { name: "Send message" }).click();
  expect((await replyResponse).ok()).toBe(true);
  await expect(page.locator("section").getByText(reply)).toBeVisible();
  const conversationId = new URL(page.url()).pathname.split("/").at(-1);
  await page.goto("/messages");
  await expect(page.getByText(reply)).toBeVisible();
  await page.request.post("/api/v1/auth/logout");
  await login(page, "Manager");
  const response = await page.request.get(`/api/v1/conversations/${conversationId}`);
  expect(response.status()).toBe(404);
});

test("seller browses buyers, opens a profile, and contacts buyer", async ({ page }) => {
  await login(page, "Seller");
  const message = `We have a regulated fintech asset that may fit your thesis ${Date.now()}.`;
  await page.goto("/buyers");
  await expect(page.getByRole("heading", { name: "Qualified acquisition mandates" })).toBeVisible();
  await Promise.all([
    page.waitForURL(/\/buyers\/.+/, { timeout: submitTimeout }),
    page.getByRole("link", { name: /View buyer mandate/ }).first().click(),
  ]);
  await page.getByLabel("Private message").fill(message);
  await page.getByRole("button", { name: "Contact buyer" }).click();
  await expect(page).toHaveURL(/messages\/.+/, { timeout: submitTimeout });
  await expect(page.getByText(message)).toBeVisible();
});

test("manager suspends and restores seller, and suspended seller cannot mutate", async ({ page, browser }) => {
  await login(page, "Manager");
  await page.goto("/manager?userSearch=seller%40n5deal.demo");
  const participants = page.locator("section").filter({ hasText: "Participants" });
  const sellerRow = participants.locator("tbody tr").filter({ hasText: "Bellwether Advisory" });
  await expect(sellerRow).toBeVisible();
  await sellerRow.getByRole("button", { name: "Suspend" }).click();
  const suspendResponse = page.waitForResponse((response) => response.url().includes("/api/v1/manager/users/") && response.url().endsWith("/status") && response.request().method() === "PATCH");
  await sellerRow.getByRole("button", { name: "Confirm" }).click();
  expect((await suspendResponse).ok()).toBe(true);
  await page.reload();
  await expect(sellerRow.getByText("Suspended")).toBeVisible();

  const sellerContext = await browser.newContext();
  const suspendedLogin = await sellerContext.request.post("/api/v1/auth/login", { data: { email: "seller@n5deal.demo", password: "SellerDemo2025!" } });
  expect(suspendedLogin.status()).toBe(403);
  await sellerContext.close();

  await sellerRow.getByRole("button", { name: "Restore" }).click();
  const restoreResponse = page.waitForResponse((response) => response.url().includes("/api/v1/manager/users/") && response.url().endsWith("/status") && response.request().method() === "PATCH");
  await sellerRow.getByRole("button", { name: "Confirm" }).click();
  expect((await restoreResponse).ok()).toBe(true);
  await page.reload();
  await expect(sellerRow.getByText("Active")).toBeVisible();
  await expect(page.getByText("User Restored").first()).toBeVisible();
});

test("manager suspended asset disappears and seller cannot republish it", async ({ page, browser }) => {
  await login(page, "Manager");
  const assetResponse = await page.request.get("/api/v1/assets/orbit-payments-ltd");
  const assetPayload = await assetResponse.json() as { data: { id: string } };
  await page.goto("/manager?assetSearch=Orbit");
  const assets = page.locator("section").filter({ hasText: "Marketplace supply" });
  const assetRow = assets.locator("tbody tr").filter({ hasText: "Orbit Payments Ltd" });
  await expect(assetRow).toBeVisible();
  await assetRow.getByRole("button", { name: "Suspend" }).click();
  const suspendResponse = page.waitForResponse((response) => response.url().includes("/api/v1/manager/assets/") && response.url().endsWith("/status") && response.request().method() === "PATCH");
  await assetRow.getByRole("button", { name: "Confirm" }).click();
  expect((await suspendResponse).ok()).toBe(true);
  await page.reload();
  await expect(assetRow.getByText("Suspended")).toBeVisible();
  await page.goto("/marketplace?search=Orbit");
  await expect(page.getByText("No matching assets")).toBeVisible();

  const sellerContext = await browser.newContext();
  const loginResponse = await sellerContext.request.post("/api/v1/auth/login", { data: { email: "seller@n5deal.demo", password: "SellerDemo2025!" } });
  expect(loginResponse.ok()).toBe(true);
  const republishResponse = await sellerContext.request.post(`/api/v1/assets/${assetPayload.data.id}/publish`);
  expect(republishResponse.status()).toBe(409);
  await sellerContext.close();
});

test("unauthorized account receives forbidden manager API response", async ({ page }) => {
  await login(page, "Buyer");
  const response = await page.request.get("/api/v1/manager/users");
  expect(response.status()).toBe(403);
});
