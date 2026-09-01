import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/server/services/auth-service";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <AppShell email={user.email} role={user.role}>{children}</AppShell>;
}
