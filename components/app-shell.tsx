"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type Props = { email: string; role: string; children: React.ReactNode };

export function AppShell({ email, role, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigation = [
    { label: "Overview", path: "/dashboard" },
    { label: "Marketplace", path: "/marketplace" },
    { label: "Messages", path: "/messages" },
    ...(role === "SELLER" ? [{ label: "My assets", path: "/seller/assets" }, { label: "Buyers", path: "/buyers" }] : []),
    ...(role === "BUYER" ? [{ label: "Acquisition criteria", path: "/buyer/profile" }] : []),
    ...(role === "MANAGER" ? [{ label: "Operations", path: "/manager" }] : []),
  ];

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/v1/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  function isActive(path: string) {
    return pathname === path || (path === "/marketplace" && pathname.startsWith("/assets")) || (path !== "/dashboard" && pathname.startsWith(`${path}/`));
  }

  return <div className="min-h-screen bg-[#f4f7f5]">
    <a href="#main-content" className="skip-link">Skip to content</a>
    <header className="sticky top-0 z-30 border-b border-[#d8e1dd] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-7 px-4 sm:px-8 lg:h-[68px] lg:px-10">
        <Logo />
        <nav aria-label="Primary navigation" className="hidden min-w-0 flex-1 items-stretch self-stretch lg:flex">
          {navigation.map((item) => {
            const active = isActive(item.path);
            return <Link key={item.path} href={item.path} aria-current={active ? "page" : undefined} className={`focus-ring relative flex items-center px-3 text-[13px] font-semibold transition-colors ${active ? "text-[#084c3c]" : "text-[#5c6a65] hover:text-[#101816]"}`}>{item.label}{active && <span className="absolute inset-x-3 bottom-0 h-0.5 bg-[#0d6b53]" />}</Link>;
          })}
        </nav>
        <div className="ml-auto hidden items-center gap-3 lg:flex">
          <div className="text-right"><p className="max-w-[180px] truncate text-xs font-semibold text-[#26332f]">{email}</p><p className="mt-0.5 text-[9px] font-bold uppercase tracking-[.1em] text-[#71807a]">{role.toLowerCase()} account</p></div>
          <button type="button" onClick={logout} disabled={loggingOut} className="focus-ring action-ghost h-9 px-3 text-[10px] font-bold uppercase tracking-[.08em] disabled:opacity-60">{loggingOut ? "Signing out" : "Sign out"}</button>
        </div>
        <button type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)} className="focus-ring ml-auto flex h-10 w-10 items-center justify-center border border-[#b9c7c1] text-xl text-[#101816] lg:hidden">{menuOpen ? "×" : "≡"}</button>
      </div>
      <div data-open={menuOpen ? "true" : "false"} className="app-mobile-nav border-t border-[#d8e1dd] bg-white lg:hidden">
        <nav aria-label="Mobile navigation" className="grid px-4 py-2 sm:px-8">{navigation.map((item) => {
          const active = isActive(item.path);
          return <Link key={item.path} href={item.path} aria-current={active ? "page" : undefined} onClick={() => setMenuOpen(false)} className={`focus-ring flex min-h-11 items-center justify-between border-b border-[#edf1ef] px-1 text-sm font-semibold last:border-0 ${active ? "text-[#0d6b53]" : "text-[#40504b]"}`}>{item.label}{active && <span aria-hidden="true">•</span>}</Link>;
        })}</nav>
        <div className="flex items-center justify-between gap-3 border-t border-[#d8e1dd] px-4 py-3 sm:px-8"><div className="min-w-0"><p className="truncate text-xs font-semibold">{email}</p><p className="text-[9px] uppercase tracking-[.1em] text-[#6b7873]">{role}</p></div><button type="button" onClick={logout} disabled={loggingOut} className="focus-ring action-ghost h-10 px-4 text-xs font-semibold">Sign out</button></div>
      </div>
    </header>
    <main id="main-content" className="min-h-[calc(100vh-64px)]">{children}</main>
  </div>;
}

function Logo() {
  return <Link href="/dashboard" aria-label="N5Deal home" className="focus-ring flex shrink-0 items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-[2px] bg-[#084c3c] text-[11px] font-extrabold text-white">N5</span><span><span className="block text-[13px] font-extrabold tracking-[.08em] text-[#101816]">N5DEAL</span><span className="mt-0.5 hidden text-[8px] font-bold uppercase tracking-[.08em] text-[#6b7873] sm:block">Private market</span></span></Link>;
}
