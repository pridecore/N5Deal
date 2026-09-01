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
  return <div className="noise min-h-screen"><div className="fine-grid absolute inset-0 opacity-50" aria-hidden="true" /><div className="deal-shell">
    <Link href="/marketplace" className="focus-ring text-[10px] font-bold uppercase tracking-[.14em] text-[#7a817f] hover:text-[#b7653b]">← Back to marketplace</Link>
    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]"><div><div className="flex flex-wrap items-center gap-2"><span className="deal-badge">{asset.country as string}</span><span className="deal-badge">{labelize(asset.category as string)}</span><span className="deal-badge status-live">{labelize(asset.status as string)}</span></div><h1 className="display compact-heading mt-5 max-w-[760px] text-[#172532]">{asset.title as string}</h1><div className="mt-8 border-y border-[#d9d4c9] py-6"><p className="stat-label">Asking Price</p><p className="mt-2 text-4xl font-bold tracking-[-.04em] text-[#172532]">{formatMoney(asset.askingPrice as string | null, asset.currency as string)}</p></div><p className="mt-8 max-w-[660px] text-base leading-7 text-[#50606a]">{asset.description as string}</p><div className="mt-10 grid gap-px border border-[#d9d4c9] bg-[#d9d4c9] sm:grid-cols-3"><Metric label="Revenue" value={formatMoney(asset.revenue as string | null, asset.currency as string)} /><Metric label="EBITDA" value={formatMoney(asset.ebitda as string | null, asset.currency as string)} /><Metric label="Deal type" value={labelize(asset.dealType as string)} /></div><section className="mt-10 border-t border-[#d9d4c9] pt-6"><p className="eyebrow">Deal information</p><div className="mt-5 grid gap-px border border-[#d9d4c9] bg-[#d9d4c9] sm:grid-cols-2"><Metric label="Business status" value={asset.businessStatus as string} /><Metric label="Seller" value={seller.companyName} /></div></section></div>
      <aside className="market-panel h-fit p-6 sm:p-8"><p className="eyebrow">Opportunity brief</p>{asset.match && <div className="mt-8 border border-[#cbd8d0] bg-[#edf4ef] p-4"><div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#5f816d]">{asset.match.level} match</p><p className="text-2xl font-bold text-[#172532]">{asset.match.score}%</p></div><ul className="mt-3 space-y-2 text-xs leading-5 text-[#50606a]">{asset.match.reasons.slice(0, 3).map((reason) => <li key={reason}>{reason}</li>)}</ul>{asset.match.mismatches[0] && <p className="mt-3 border-t border-[#cbd8d0] pt-3 text-xs leading-5 text-[#7a817f]">{asset.match.mismatches[0]}</p>}</div>}<div className="mt-8 border-t border-[#d9d4c9] pt-5"><p className="stat-label">Presented by</p><p className="mt-2 text-sm font-bold">{seller.companyName}</p><p className="mt-1 text-xs text-[#7a817f]">{seller.fullName}</p></div>{user.role === "BUYER" ? <ContactAssetForm assetId={asset.id as string} /> : <p className="mt-8 border-t border-[#d9d4c9] pt-5 text-xs leading-5 text-[#7a817f]">Buyers can start a private platform conversation from this brief.</p>}</aside>
    </div>
    <div className="mt-16 border-t border-[#d9d4c9] pt-5 text-[10px] font-bold uppercase tracking-[.14em] text-[#a1a39b]">Published opportunity <span className="mx-2">·</span> {labelize(asset.status as string)}</div>
  </div></div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="bg-[#fbfaf6] p-4 sm:p-5"><p className="stat-label">{label}</p><p className="mt-2 text-sm font-bold leading-5 text-[#172532]">{value}</p></div>; }
