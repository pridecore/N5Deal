import { getCurrentUser } from "@/server/services/auth-service";
import { findMarketplaceCounts } from "@/server/repositories/user-repository";
import { RoleDashboard } from "@/components/role-dashboard";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const counts = user.role === "MANAGER" ? await findMarketplaceCounts() : undefined;
  return <RoleDashboard email={user.email} role={user.role} counts={counts} />;
}
