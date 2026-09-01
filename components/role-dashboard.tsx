import Link from "next/link";

type Props = { email: string; role: string; counts?: [number, number, number, number] };

const workspace: Record<string, { eyebrow: string; title: string; description: string; primary: { label: string; href: string }; actions: Array<{ label: string; detail: string; href: string }> }> = {
  BUYER: {
    eyebrow: "Buyer workspace",
    title: "Acquisition overview",
    description: "Manage your mandate, review relevant opportunities and keep deal conversations in one private workspace.",
    primary: { label: "Browse marketplace", href: "/marketplace" },
    actions: [
      { label: "Acquisition criteria", detail: "Set sectors, geographies, investment and financial ranges", href: "/buyer/profile" },
      { label: "Active marketplace", detail: "Review published opportunities with Smart Match context", href: "/marketplace" },
      { label: "Deal conversations", detail: "Continue private discussions with sellers", href: "/messages" },
    ],
  },
  SELLER: {
    eyebrow: "Seller workspace",
    title: "Deal inventory overview",
    description: "Prepare opportunities, manage listing lifecycle and identify buyers whose mandate fits your assets.",
    primary: { label: "Create asset", href: "/seller/assets/new" },
    actions: [
      { label: "Asset inventory", detail: "Review drafts, published listings and archived opportunities", href: "/seller/assets" },
      { label: "Buyer discovery", detail: "Compare acquisition theses, ranges and target markets", href: "/buyers" },
      { label: "Deal conversations", detail: "Continue private discussions with buyers", href: "/messages" },
    ],
  },
  MANAGER: {
    eyebrow: "Manager workspace",
    title: "Marketplace operations",
    description: "Monitor participants, marketplace supply, moderation state and recent audit events.",
    primary: { label: "Open operations", href: "/manager" },
    actions: [
      { label: "Participants", detail: "Review Buyer and Seller access status", href: "/manager" },
      { label: "Marketplace assets", detail: "Moderate published and suspended opportunities", href: "/manager" },
      { label: "Audit trail", detail: "Review recent platform actions", href: "/manager" },
    ],
  },
};

export function RoleDashboard({ email, role, counts }: Props) {
  const copy = workspace[role] ?? workspace.BUYER;
  const metrics = role === "MANAGER" && counts ? [
    { label: "Active buyers", value: String(counts[0]), note: "participant accounts" },
    { label: "Active sellers", value: String(counts[1]), note: "participant accounts" },
    { label: "Published assets", value: String(counts[2]), note: "visible opportunities" },
    { label: "Active threads", value: String(counts[3]), note: "private conversations" },
  ] : [
    { label: "Account role", value: role === "BUYER" ? "Buyer" : "Seller", note: "server-enforced access" },
    { label: "Marketplace", value: "Active", note: "published supply" },
    { label: "Messaging", value: "Private", note: "participant-only threads" },
    { label: "Session", value: "Secure", note: "role-aware workspace" },
  ];

  return <div className="min-h-screen"><div className="market-shell">
    <header className="grid gap-6 border-b border-[#d8e1dd] pb-6 lg:grid-cols-[1fr_auto] lg:items-end">
      <div><p className="eyebrow">{copy.eyebrow}</p><h1 className="display compact-heading mt-2">{copy.title}</h1><p className="mt-3 max-w-[650px] text-sm leading-6 text-[#52615c]">{copy.description}</p><p className="mt-2 text-xs text-[#77837e]">Signed in as {email}</p></div>
      <Link href={copy.primary.href} className="focus-ring action-primary flex h-11 w-full items-center justify-between px-4 text-[10px] font-bold uppercase tracking-[.08em] sm:w-[190px]">{copy.primary.label}<span aria-hidden="true">→</span></Link>
    </header>

    <section aria-label="Workspace summary" className="data-grid mt-5 grid-cols-2 lg:grid-cols-4">{metrics.map((metric) => <div key={metric.label} className="data-cell min-h-[92px]"><p className="stat-label">{metric.label}</p><p className="mt-2 text-xl font-bold text-[#101816]">{metric.value}</p><p className="mt-1 text-[11px] text-[#6b7873]">{metric.note}</p></div>)}</section>

    <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div><div className="section-kicker"><div><p className="text-sm font-bold">Workspace actions</p><p className="mt-1 text-xs text-[#6b7873]">Role-specific tools and current next steps</p></div></div><div className="mt-3 divide-y divide-[#d8e1dd] border-y border-[#d8e1dd] bg-white">{copy.actions.map((action, index) => <Link key={action.href + action.label} href={action.href} className="focus-ring grid min-h-[82px] gap-2 px-4 py-4 transition-colors hover:bg-[#eef3f0] sm:grid-cols-[44px_200px_1fr_auto] sm:items-center"><span className="text-xs font-bold text-[#0d6b53]">0{index + 1}</span><span className="text-sm font-bold text-[#101816]">{action.label}</span><span className="text-xs leading-5 text-[#6b7873]">{action.detail}</span><span className="text-[#0d6b53]" aria-hidden="true">→</span></Link>)}</div></div>
      <aside className="border border-[#d8e1dd] bg-[#eef3f0] p-5"><p className="stat-label">Data handling</p><h2 className="mt-3 text-lg font-semibold">Private by default</h2><p className="mt-3 text-sm leading-6 text-[#52615c]">Profiles, ownership and conversation access are enforced on the server. Contact details remain inside the platform workflow.</p><div className="mt-5 border-t border-[#cbd6d1] pt-4"><p className="flex items-center gap-2 text-xs font-semibold text-[#176548]"><span className="h-2 w-2 rounded-full bg-[#237354]" />Access active</p></div></aside>
    </section>
  </div></div>;
}
