import Link from "next/link";

type Props = { email: string; role: string; counts?: [number, number, number, number] };

const roleCopy: Record<string, { eyebrow: string; title: string; description: string; action: string }> = {
  BUYER: { eyebrow: "Buyer workspace", title: "Find the signal\nin the noise.", description: "Your acquisition brief is the starting point. Once the marketplace is connected, matched opportunities will gather here.", action: "Define your criteria" },
  SELLER: { eyebrow: "Seller workspace", title: "Put your asset\nin motion.", description: "Prepare a considered listing, keep your materials private, and meet the right counterparties when the timing is right.", action: "Create an asset" },
  MANAGER: { eyebrow: "Platform control", title: "Keep the market\nhealthy.", description: "A clear view across participants, assets, and contact activity. Governance begins with good information.", action: "Open operations" },
};

export function RoleDashboard({ email, role, counts }: Props) {
  const copy = roleCopy[role] ?? roleCopy.BUYER;
  const isManager = role === "MANAGER";
  const metrics = isManager && counts ? [
    { label: "Active buyers", value: counts[0].toString().padStart(2, "0"), note: "verified participants" },
    { label: "Active sellers", value: counts[1].toString().padStart(2, "0"), note: "verified participants" },
    { label: "Published assets", value: counts[2].toString().padStart(2, "0"), note: "currently visible" },
    { label: "Active threads", value: counts[3].toString().padStart(2, "0"), note: "conversation flow" },
  ] : [
    { label: "Workspace status", value: "01", note: "ready to configure" },
    { label: "Security layer", value: "ON", note: "server-side session" },
    { label: "Next milestone", value: "02", note: "marketplace tools" },
  ];

  return <div className="noise min-h-screen overflow-hidden"><div className="fine-grid absolute inset-0 opacity-60" aria-hidden="true" /><div className="relative mx-auto max-w-[1280px] px-5 py-8 sm:px-8 sm:py-12 lg:px-14 lg:py-16">
    <div className="flex items-start justify-between"><div><p className="eyebrow rise">{copy.eyebrow}</p><p className="mt-3 text-xs text-[#7a817f] rise rise-delay">Good morning, {email.split("@")[0]}.</p></div><div className="hidden items-center gap-3 text-right sm:flex"><span className="h-2 w-2 rounded-full bg-[#6b8c7b]" /><span className="text-[10px] font-bold uppercase tracking-[.15em] text-[#7a817f]">All systems nominal</span></div></div>
    <section className="mt-16 max-w-[750px] sm:mt-20"><h1 className="display whitespace-pre-line text-[clamp(3.3rem,7vw,6.7rem)] leading-[.9] tracking-[-.065em] text-[#172532] rise rise-delay">{copy.title}</h1><p className="mt-8 max-w-[460px] text-[15px] leading-7 text-[#50606a] rise rise-delay-2">{copy.description}</p><Link href={role === "BUYER" ? "/buyer/profile" : role === "SELLER" ? "/seller/assets/new" : "/manager"} className="focus-ring mt-9 inline-block border-b border-[#b7653b] pb-2 text-xs font-bold uppercase tracking-[.14em] text-[#b7653b] transition-colors hover:text-[#172532] rise rise-delay-2">{copy.action} <span className="ml-3 text-base">↗</span></Link></section>
    <section className="mt-20 grid grid-cols-2 border-y border-[#d9d4c9] sm:grid-cols-3 lg:grid-cols-4">{metrics.map((metric, index) => <div key={metric.label} className={`${index === 0 ? "border-l-0" : "border-l"} border-[#d9d4c9] px-4 py-6 sm:px-6 lg:py-8`}><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#7a817f]">{metric.label}</p><p className="display mt-5 text-4xl tracking-[-.04em] text-[#172532]">{metric.value}</p><p className="mt-2 text-xs text-[#7a817f]">{metric.note}</p></div>)}</section>
    <section className="mt-16 grid gap-5 lg:grid-cols-[1.25fr_1fr]"><div className="min-h-[220px] border border-[#d9d4c9] bg-[#e8e2d8]/55 p-7 sm:p-9"><div className="flex items-start justify-between"><p className="eyebrow">Phase 01 / Foundation</p><span className="text-2xl text-[#b7653b]">↗</span></div><h2 className="display mt-12 max-w-[370px] text-3xl leading-none tracking-[-.045em]">An intentional starting point for better deals.</h2></div><div className="min-h-[220px] bg-[#d7e3dc] p-7 sm:p-9"><p className="eyebrow text-[#4e6c5c]">Access verified</p><div className="mt-12 flex items-end justify-between"><h2 className="display max-w-[210px] text-3xl leading-none tracking-[-.045em] text-[#172532]">You’re in the right room.</h2><span className="text-5xl font-light text-[#4e6c5c]">✓</span></div></div></section>
    <p className="mt-12 text-[10px] font-bold uppercase tracking-[.14em] text-[#a1a39b]">N5Deal private market prototype <span className="mx-2">·</span> Role-aware access layer</p>
  </div></div>;
}
