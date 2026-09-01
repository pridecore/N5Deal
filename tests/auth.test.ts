import { describe, expect, it } from "vitest";
import { hasPermission, permissions } from "@/server/auth/permissions";
import { loginSchema } from "@/validation/auth";

describe("marketplace permissions", () => {
  it("allows sellers to create assets but not buyers", () => {
    expect(hasPermission("SELLER", "createAsset")).toBe(true);
    expect(hasPermission("BUYER", "createAsset")).toBe(false);
  });

  it("restricts participant governance to managers", () => {
    expect(permissions.manageParticipants).toEqual(["MANAGER"]);
    expect(hasPermission("MANAGER", "manageParticipants")).toBe(true);
    expect(hasPermission("SELLER", "manageParticipants")).toBe(false);
  });

  it("gives buyers the contact action", () => {
    expect(hasPermission("BUYER", "contactSeller")).toBe(true);
    expect(hasPermission("MANAGER", "contactSeller")).toBe(false);
  });

  it("rejects malformed login credentials before a database lookup", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "short" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "buyer@n5deal.demo", password: "BuyerDemo2025!" }).success).toBe(true);
  });
});
