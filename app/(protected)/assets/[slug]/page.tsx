import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/server/services/auth-service";
import { getAssetDetails } from "@/server/services/asset-service";
import { formatMoney, labelize } from "@/lib/utils";
import { ContactAssetForm } from "@/components/contact-asset-form";

type SellerSummary = { companyName: string; fullName: string; bio?: string };

export default async function AssetDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { slug } = await params;
  let asset: Awaited<ReturnType<typeof getAssetDetails>>;
  try { asset = await getAssetDetails(slug, user); } catch { notFound(); }
  const seller = asset.seller as SellerSummary;
  const reference = `#${String(asset.id).slice(-6).toUpperCase()}`;
  return <div className="noise min-h-screen"><div className="fine-grid absolute inset-0 opacity-50" aria-hidden="true" /><div className="deal-shell">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d6d0c4] pb-4">
      <Link href="/marketplace" className="focus-ring text-[10px] font-bold uppercase tracking-[.14em] text-[#737a78] hover:text-[#a85834]">← Back to marketplace</Link>
      <div className="flex flex-wrap gap-2"><span className="deal-badge">Asset ID {reference}</span><span className="deal-badge status-live">Validated</span></div>
    </div>
    <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
      <div>
        <div className="flex flex-wrap items-center gap-2"><span className="deal-badge">{asset.country as string}</span><span className="deal-badge">{labelize(asset.category as string)}</span><span className="deal-badge">{asset.businessStatus as string}</span><span className="deal-badge">{labelize(asset.dealType as string)}</span></div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_260px] lg:items-end">
          <h1 className="display compact-heading max-w-[760px] text-[#111a22]">{asset.title as string}</h1>
          <div className="border-l-2 border-[#a85834] pl-5"><p className="stat-label">Asking Price</p><p className="price-figure mt-2">{formatMoney(asset.askingPrice as string | null, asset.currency as string)}</p></div>
        </div>
        <div className="data-grid mt-7 grid-cols-2 md:grid-cols-4"><Metric label="Country" value={asset.country as string} /><Metric label="Type of business" value={labelize(asset.category as string)} /><Metric label="Business status" value={asset.businessStatus as string} /><Metric label="Seller" value={seller.companyName} /></div>
        <section className="mt-8"><div className="section-kicker"><p className="eyebrow">Financial overview</p><p className="text-[11px] text-[#737a78]">Indicative seller-provided figures</p></div><div className="data-grid mt-4 grid-cols-1 sm:grid-cols-3"><Metric label="Revenue" value={formatMoney(asset.revenue as string | null, asset.currency as string)} /><Metric label="EBITDA" value={formatMoney(asset.ebitda as string | null, asset.currency as string)} /><Metric label="Deal type" value={labelize(asset.dealType as string)} /></div></section>
        <section className="mt-8 border-y border-[#d6d0c4] bg-[#fffefa] p-5"><p className="eyebrow">Business overview</p><p className="mt-4 max-w-[760px] text-base leading-7 text-[#485862]">{asset.description as string}</p></section>
        <section className="mt-8"><p className="eyebrow">Regulatory / license information</p><div className="data-grid mt-4 grid-cols-1 sm:grid-cols-3"><Metric label="Regulatory signal" value={labelize(asset.category as string)} /><Metric label="Jurisdiction" value={asset.country as string} /><Metric label="Review marker" value="Preliminary platform validation" /></div></section>
        <section className="mt-8"><p className="eyebrow">Included capabilities</p><div className="mt-4 flex flex-wrap gap-2">{includedCapabilities(asset.category as string).map((item) => <span key={item} className="deal-badge">{item}</span>)}</div></section>
      </div>
      <aside className="market-panel h-fit p-5 lg:sticky lg:top-6"><p className="eyebrow">Opportunity brief</p>{asset.match && <div className="mt-6 border border-[#c7d8ce] bg-[#edf6f1] p-4"><div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#416f58]">{asset.match.level} match</p><p className="text-3xl font-bold text-[#111a22]">{asset.match.score}%</p></div><ul className="mt-3 space-y-2 text-xs leading-5 text-[#485862]">{asset.match.reasons.slice(0, 4).map((reason) => <li key={reason}>{reason}</li>)}</ul>{asset.match.mismatches[0] && <p className="mt-3 border-t border-[#c7d8ce] pt-3 text-xs leading-5 text-[#737a78]">{asset.match.mismatches[0]}</p>}</div>}<div className="mt-6 border-t border-[#d6d0c4] pt-5"><p className="stat-label">Presented by</p><p className="mt-2 text-sm font-bold">{seller.companyName}</p><p className="mt-1 text-xs text-[#737a78]">{seller.fullName}</p>{seller.bio && <p className="mt-3 text-xs leading-5 text-[#485862]">{seller.bio}</p>}</div>{user.role === "BUYER" ? <ContactAssetForm assetId={asset.id as string} /> : <p className="mt-6 border-t border-[#d6d0c4] pt-5 text-xs leading-5 text-[#737a78]">Buyers can start a private platform conversation from this brief.</p>}</aside>
    </div>
    <div className="mt-16 border-t border-[#d9d4c9] pt-5 text-[10px] font-bold uppercase tracking-[.14em] text-[#a1a39b]">Published opportunity <span className="mx-2">·</span> {labelize(asset.status as string)}</div>
  </div></div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="data-cell"><p className="stat-label">{label}</p><p className="mt-2 text-sm font-bold leading-5 text-[#111a22]">{value}</p></div>; }

function includedCapabilities(category: string): string[] {
  const common = ["Seller verified", "Financial snapshot", "Private messaging"];
  if (category === "PAYMENT") return ["Payments", "Multi-currency", "Client portfolio", ...common];
  if (category === "FINTECH") return ["Software", "Data room ready", "Recurring revenue", ...common];
  if (category === "EMI") return ["EMI signal", "Regulatory perimeter", "EU market access", ...common];
  if (category === "BANK") return ["Banking license", "Credit book", "Regulatory perimeter", ...common];
  if (category === "CRYPTO") return ["Digital assets", "Custody workflow", "Compliance posture", ...common];
  return common;
}
