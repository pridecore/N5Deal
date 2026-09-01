import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { AssetStatus, Prisma, UserRole, UserStatus } from "@prisma/client";
import { scoreAssetForBuyer } from "@/server/services/match-service";
import { messageBodySchema } from "@/validation/messages";
import { assertTrustedOrigin } from "@/server/security/csrf";
import { assertRateLimit, rateLimitKey, resetRateLimitsForTests } from "@/server/security/rate-limit";

const dbMock = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn(), count: vi.fn() },
  asset: { findUnique: vi.fn(), update: vi.fn(), count: vi.fn(), findMany: vi.fn() },
  conversation: { findFirst: vi.fn(), findMany: vi.fn() },
  message: { create: vi.fn() },
  auditEvent: { create: vi.fn(), count: vi.fn(), findMany: vi.fn() },
  $transaction: vi.fn(),
}));

vi.mock("@/server/db", () => ({ db: dbMock }));
vi.mock("@/server/services/audit-service", () => ({ recordAuditEvent: vi.fn() }));

function preference(overrides = {}) {
  return {
    investmentMin: new Prisma.Decimal("1000000"),
    investmentMax: new Prisma.Decimal("5000000"),
    revenueMin: new Prisma.Decimal("500000"),
    revenueMax: new Prisma.Decimal("4000000"),
    ebitdaMin: new Prisma.Decimal("100000"),
    ebitdaMax: new Prisma.Decimal("1000000"),
    categories: [{ category: "FINTECH" as const }],
    countries: [{ country: "Germany" }],
    dealTypes: [{ dealType: "FULL_ACQUISITION" as const }],
    ...overrides,
  };
}

function asset(overrides = {}) {
  return {
    category: "FINTECH" as const,
    country: "Germany",
    askingPrice: new Prisma.Decimal("3200000"),
    revenue: new Prisma.Decimal("2200000"),
    ebitda: new Prisma.Decimal("520000"),
    dealType: "FULL_ACQUISITION" as const,
    businessStatus: "Trading",
    ...overrides,
  };
}

describe("smart deal matching", () => {
  it("scores exact structured matches strongly and deterministically", () => {
    const first = scoreAssetForBuyer(asset(), preference());
    const second = scoreAssetForBuyer(asset(), preference());
    expect(first).toEqual(second);
    expect(first?.score).toBe(100);
    expect(first?.level).toBe("Strong");
  });

  it("captures geography mismatch and financial boundaries", () => {
    const match = scoreAssetForBuyer(asset({ country: "France", askingPrice: new Prisma.Decimal("5000000") }), preference());
    expect(match?.score).toBeGreaterThanOrEqual(0);
    expect(match?.score).toBeLessThanOrEqual(100);
    expect(match?.mismatches).toContain("France is outside preferred geographies.");
    expect(match?.reasons.some((reason) => reason.includes("investment range"))).toBe(true);
  });

  it("returns no score when a buyer has no preferences", () => {
    expect(scoreAssetForBuyer(asset(), null)).toBeNull();
  });
});

describe("message and request hardening", () => {
  beforeEach(() => resetRateLimitsForTests());

  it("rejects script-like message bodies", () => {
    expect(messageBodySchema.safeParse("Hello seller").success).toBe(true);
    expect(messageBodySchema.safeParse("<script>alert(1)</script>").success).toBe(false);
  });

  it("rejects invalid mutation origins", () => {
    const request = new NextRequest("http://localhost:3000/api/v1/conversations", { method: "POST", headers: { origin: "https://evil.example" } });
    expect(() => assertTrustedOrigin(request)).toThrow("Cross-site mutation rejected.");
  });

  it("returns a rate-limit error after the configured limit", () => {
    const key = rateLimitKey("message", "user-1");
    assertRateLimit({ key, limit: 2, windowMs: 60_000 });
    assertRateLimit({ key, limit: 2, windowMs: 60_000 });
    expect(() => assertRateLimit({ key, limit: 2, windowMs: 60_000 })).toThrow("Too many requests.");
  });
});

describe("manager moderation services", () => {
  beforeEach(() => vi.clearAllMocks());

  it("suspends and restores a buyer", async () => {
    const { updateUserModerationStatus } = await import("@/server/services/manager-service");
    dbMock.user.findUnique.mockResolvedValue({ id: "buyer-1", role: UserRole.BUYER, status: UserStatus.ACTIVE });
    dbMock.user.update.mockResolvedValue({});
    await expect(updateUserModerationStatus("manager-1", "buyer-1", UserStatus.SUSPENDED)).resolves.toEqual({ id: "buyer-1", status: UserStatus.SUSPENDED });
    expect(dbMock.user.update).toHaveBeenCalledWith({ where: { id: "buyer-1" }, data: { status: UserStatus.SUSPENDED } });
  });

  it("restores a suspended asset to its previous status", async () => {
    const { restoreAsset } = await import("@/server/services/manager-service");
    dbMock.asset.findUnique.mockResolvedValue({ id: "asset-1", status: AssetStatus.SUSPENDED, previousStatus: AssetStatus.PUBLISHED });
    dbMock.asset.update.mockResolvedValue({});
    await expect(restoreAsset("manager-1", "asset-1")).resolves.toEqual({ id: "asset-1", status: AssetStatus.PUBLISHED });
    expect(dbMock.asset.update).toHaveBeenCalledWith({ where: { id: "asset-1" }, data: { status: AssetStatus.PUBLISHED, previousStatus: null } });
  });
});

describe("conversation services", () => {
  beforeEach(() => vi.clearAllMocks());

  it("hides conversations from unrelated users", async () => {
    const { getConversation } = await import("@/server/services/conversation-service");
    dbMock.conversation.findFirst.mockResolvedValue(null);
    await expect(getConversation("thread-1", "stranger")).rejects.toThrow("Conversation not found.");
  });

  it("blocks suspended users from messaging", async () => {
    const { sendMessage } = await import("@/server/services/conversation-service");
    dbMock.user.findUnique.mockResolvedValue({ status: UserStatus.SUSPENDED });
    await expect(sendMessage("thread-1", "seller-1", { body: "Hello" })).rejects.toThrow("Suspended users cannot use messaging.");
  });
});
