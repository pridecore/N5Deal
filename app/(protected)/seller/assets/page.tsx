import Link from "next/link";
import { requirePageRole } from "@/server/auth/page-guards";
import { getSellerAssets } from "@/server/services/asset-service";
import { AssetLifecycleActions } from "@/components/asset-lifecycle-actions";
import { formatMoney, labelize } from "@/lib/utils";

export default async function SellerAssetsPage() {
  const user = await requirePageRole("SELLER");
  const assets = await getSellerAssets(user.id);
  return <div className="noise min-h-screen"><div className="fine-grid absolute inset-0 opacity-50" aria-hidden="true" /><div className="market-shell">
    <div className="flex flex-col justify-between gap-5 border-b border-[#d6d0c4] pb-5 sm:flex-row sm:items-end"><div><p className="eyebrow">Seller studio / inventory</p><h1 className="display compact-heading mt-2">Manage listed assets.</h1><p className="mt-4 max-w-[540px] text-sm leading-6 text-[#485862]">Prepare structured opportunity records, keep drafts private, and publish only when the deal is ready for buyer review.</p></div><Link href="/seller/assets/new" className="focus-ring action-primary inline-flex h-11 items-center justify-between px-5 text-[10px] font-bold uppercase tracking-[.14em] sm:w-[170px]">New asset <span className="text-base" aria-hidden="true">↗</span></Link></div>
    {assets.length === 0 ? <div className="py-20 text-center"><p className="eyebrow">Nothing here yet</p><h2 className="display mt-4 text-4xl tracking-[-.04em]">Start with a draft.</h2><p className="mt-4 text-sm text-[#50606a]">Your first opportunity can stay private until it is ready to be seen.</p></div> : <div className="mt-6 space-y-3">{assets.map((asset) => <div key={asset.id}>
    <article className="ledger-row">
      <div className="grid gap-4 p-4 lg:grid-cols-[1.2fr_180px_150px_240px] lg:items-center">
        <div><div className="flex flex-wrap gap-2"><span className="deal-badge">{asset.country}</span><span className="deal-badge">{labelize(asset.category as string)}</span><span className={`deal-badge ${asset.status === "PUBLISHED" ? "status-live" : asset.status === "ARCHIVED" ? "status-muted" : "status-warning"}`}>{labelize(asset.status as string)}</span></div><h2 className="display mt-3 text-2xl tracking-[-.035em] text-[#111a22]">{asset.title}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-[#485862]">{asset.description}</p></div>
        <div><p className="stat-label">Asking price</p><p className="mt-1 text-xl font-extrabold text-[#111a22]">{formatMoney(asset.askingPrice?.toString(), asset.currency)}</p></div>
        <div><p className="stat-label">Updated</p><p className="mt-1 text-sm font-bold text-[#111a22]">{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(asset.updatedAt))}</p></div>
        <div className="flex flex-col gap-3"><Link href={`/seller/assets/${asset.id}/edit`} className="focus-ring action-ghost flex h-10 items-center justify-between px-4 text-[10px] font-bold uppercase tracking-[.13em]">Manage asset ↗</Link><AssetLifecycleActions id={asset.id} status={asset.status as string} /></div>
      </div>
    </article>
    </div>)}</div>}
    <div className="mt-8 border-t border-[#d6d0c4] pt-5 text-[10px] font-bold uppercase tracking-[.14em] text-[#a1a39b]">{assets.length} {assets.length === 1 ? "asset" : "assets"} in your studio <span className="mx-2">·</span> Seller-only workspace</div>
  </div></div>;
}
