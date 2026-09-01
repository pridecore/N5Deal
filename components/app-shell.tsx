"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

type Props = { email: string; role: string; children: React.ReactNode };

export function AppShell({ email, role, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const initials = email.slice(0, 2).toUpperCase();
  const roleLabel = role.toLowerCase();
  const navigation = [
    { label: "Overview", path: "/dashboard", icon: "⌂" },
    { label: "Marketplace", path: "/marketplace", icon: "◫" },
    { label: "Messages", path: "/messages", icon: "✉" },
    ...(role === "SELLER" ? [{ label: "My assets", path: "/seller/assets", icon: "↗" }, { label: "Buyers", path: "/buyers", icon: "◎" }] : []),
    ...(role === "BUYER" ? [{ label: "Acquisition criteria", path: "/buyer/profile", icon: "◎" }] : []),
    ...(role === "MANAGER" ? [{ label: "Operations", path: "/manager", icon: "▦" }] : []),
  ];

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/v1/auth/logout", { method: "POST" });
    router.push("/login"); router.refresh();
  }

  return <div className="min-h-screen bg-[#f4f1ea]">
    <a href="#main-content" className="skip-link">Skip to content</a>
    <header className="flex h-[72px] items-center justify-between border-b border-[#d9d4c9] bg-[#f4f1ea] px-5 sm:px-8 lg:hidden">
      <Logo /><button type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)} className="focus-ring text-2xl text-[#172532]">{menuOpen ? "×" : "☰"}</button>
    </header>
    {menuOpen && <button type="button" aria-label="Close navigation" className="fixed inset-0 z-10 bg-[#111a22]/35 lg:hidden" onClick={() => setMenuOpen(false)} />}
    <aside data-open={menuOpen ? "true" : "false"} className="app-sidebar fixed inset-y-0 left-0 z-20 flex w-[280px] flex-col border-r border-[#d9d4c9] bg-[#172532] text-[#f4f1ea] transition-transform">
      <div className="flex h-[88px] items-center border-b border-white/10 px-8"><Logo inverse /></div>
      <div className="flex-1 px-4 py-8"><p className="mb-4 px-4 text-[10px] font-bold uppercase tracking-[.17em] text-white/35">Workspace</p><nav className="space-y-1">{navigation.map((item) => {
        const active = pathname === item.path || (item.path === "/marketplace" && pathname.startsWith("/assets")) || (item.path !== "/dashboard" && pathname.startsWith(`${item.path}/`));
        return <Link key={item.label} href={item.path} aria-current={active ? "page" : undefined} onClick={() => setMenuOpen(false)} className={`focus-ring flex items-center gap-4 px-4 py-3 text-sm transition-colors ${active ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/5 hover:text-white"}`}><span className="w-4 text-center text-lg font-light" aria-hidden="true">{item.icon}</span>{item.label}{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#d49a79]" />}</Link>;
      })}</nav></div>
      <div className="border-t border-white/10 px-8 py-7"><div className="mb-6 flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d7e3dc] text-[11px] font-bold text-[#172532]">{initials}</span><div className="min-w-0"><p className="truncate text-xs text-white">{email}</p><p className="mt-1 text-[10px] uppercase tracking-[.13em] text-[#d49a79]">{roleLabel}</p></div></div><button type="button" disabled={loggingOut} onClick={logout} className="focus-ring text-[11px] font-bold uppercase tracking-[.14em] text-white/45 transition-colors hover:text-white">{loggingOut ? "Signing out…" : "Sign out ↗"}</button></div>
    </aside>
    <main id="main-content" className="min-h-screen lg:pl-[280px]">{children}</main>
  </div>;
}

function Logo({ inverse = false }: { inverse?: boolean }) {
  return <Link href="/dashboard" className={`flex items-center gap-3 ${inverse ? "text-[#f4f1ea]" : "text-[#172532]"}`}><span className={`flex h-9 w-9 items-center justify-center text-xs font-bold tracking-[-.08em] ${inverse ? "bg-[#f4f1ea] text-[#172532]" : "bg-[#172532] text-[#f4f1ea]"}`}>N5</span><span className="text-xs font-bold tracking-[.18em]">N5DEAL</span></Link>;
}
