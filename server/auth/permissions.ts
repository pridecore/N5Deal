export type MarketplaceRole = "BUYER" | "SELLER" | "MANAGER";

export const permissions = {
  viewPublishedAssets: ["BUYER", "SELLER", "MANAGER"],
  createAsset: ["SELLER"],
  manageParticipants: ["MANAGER"],
  contactSeller: ["BUYER"],
} as const satisfies Record<string, readonly MarketplaceRole[]>;

export function hasPermission(role: MarketplaceRole, permission: keyof typeof permissions): boolean {
  return (permissions[permission] as readonly MarketplaceRole[]).includes(role);
}
