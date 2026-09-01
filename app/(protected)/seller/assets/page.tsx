import Link from "next/link";
import { requirePageRole } from "@/server/auth/page-guards";
import { getSellerAssets } from "@/server/services/asset-service";
import { AssetLifecycleActions } from "@/components/asset-lifecycle-actions";
import { formatMoney, labelize } from "@/lib/utils";

export default async function SellerAssetsPage() {
  const user = await requirePageRole("SELLER");
  const assets = await getSellerAssets(user.id);
  return <div className="min-h-screen"><div className="market-shell">
    <div className="flex flex-col justify-between gap-5 border-b border-[#d8e1dd] pb-5 sm:flex-row sm:items-end"><div><p className="eyebrow">Seller workspace / deal inventory</p><h1 className="display compact-heading mt-2">Asset inventory</h1><p className="mt-3 max-w-[620px] text-sm leading-6 text-[#52615c]">Manage opportunity data and lifecycle state. Drafts remain private until you publish them for Buyer review.</p></div><Link href="/seller/assets/new" className="focus-ring action-primary inline-flex h-11 items-center justify-between px-5 text-[10px] font-bold uppercase tracking-[.08em] sm:w-[170px]">Create asset <span aria-hidden="true">→</span></Link></div>
    {assets.length === 0 ? <div className="border border-[#d8e1dd] bg-white py-16 text-center"><p className="eyebrow">No assets</p><h2 className="mt-3 text-2xl font-semibold">Create the first draft</h2><p className="mt-3 text-sm text-[#52615c]">The opportunity remains private until it is published.</p></div> : <div className="mt-5 space-y-3">{assets.map((asset) => <div key={asset.id}>
    <article className="ledger-row">
      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1.3fr)_190px_150px_230px] lg:items-center">
        <div><div className="flex flex-wrap gap-2"><span className="deal-badge">{asset.country}</span><span className="deal-badge">{labelize(asset.category as string)}</span><span className={`deal-badge ${asset.status === "PUBLISHED" ? "status-live" : asset.status === "ARCHIVED" ? "status-muted" : "status-warning"}`}>{labelize(asset.status as string)}</span></div><h2 className="mt-2 text-lg font-semibold text-[#101816]">{asset.title}</h2><p className="mt-1 line-clamp-1 text-xs leading-5 text-[#52615c]">{asset.description}</p></div>
        <div><p className="stat-label">Asking price</p><p className="mt-1 text-xl font-bold text-[#101816]">{formatMoney(asset.askingPrice?.toString(), asset.currency)}</p></div>
        <div><p className="stat-label">Updated</p><p className="mt-1 text-sm font-semibold text-[#101816]">{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(asset.updatedAt))}</p></div>
        <div className="flex flex-col gap-2"><Link href={`/seller/assets/${asset.id}/edit`} className="focus-ring action-ghost flex h-10 items-center justify-between px-4 text-[10px] font-bold uppercase tracking-[.08em]">Manage asset <span>→</span></Link><AssetLifecycleActions id={asset.id} status={asset.status as string} /></div>
      </div>
    </article>
    </div>)}</div>}
    <div className="mt-6 border-t border-[#d8e1dd] pt-4 text-[10px] font-bold uppercase tracking-[.08em] text-[#77837e]">{assets.length} {assets.length === 1 ? "asset" : "assets"} in inventory <span className="mx-2">·</span> Seller-only workspace</div>
  </div></div>;
}
