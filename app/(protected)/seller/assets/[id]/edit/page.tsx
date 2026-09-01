import Link from "next/link";
import { notFound } from "next/navigation";
import { decimalToString } from "@/lib/decimal";
import { requirePageRole } from "@/server/auth/page-guards";
import { findAssetForOwner } from "@/server/repositories/asset-repository";
import { AssetForm } from "@/components/asset-form";
import { AssetLifecycleActions } from "@/components/asset-lifecycle-actions";

export default async function EditAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePageRole("SELLER");
  const { id } = await params;
  const asset = await findAssetForOwner(id, user.id);
  if (!asset) notFound();
  const defaults = { id: asset.id, status: asset.status, title: asset.title, category: asset.category, country: asset.country, description: asset.description, askingPrice: decimalToString(asset.askingPrice) ?? "", currency: asset.currency, revenue: decimalToString(asset.revenue) ?? "", ebitda: decimalToString(asset.ebitda) ?? "", dealType: asset.dealType, businessStatus: asset.businessStatus };
  return <div className="noise min-h-screen"><div className="deal-shell max-w-[960px]"><div className="flex items-center justify-between gap-4"><Link href="/seller/assets" className="focus-ring text-[10px] font-bold uppercase tracking-[.14em] text-[#737a78] hover:text-[#a85834]">← Back to your assets</Link><span className={`deal-badge ${asset.status === "PUBLISHED" ? "status-live" : asset.status === "SUSPENDED" ? "status-warning" : ""}`}>{asset.status.toLowerCase()}</span></div><div className="mt-7 border-b border-[#d6d0c4] pb-5"><p className="eyebrow">Asset studio / Edit</p><h1 className="display compact-heading mt-2">Refine the opportunity.</h1></div><div className="market-panel mt-6 p-5 sm:p-7"><AssetForm mode="edit" asset={defaults} /></div><div className="mt-7 border-t border-[#d6d0c4] pt-5"><p className="mb-3 stat-label">Lifecycle</p><AssetLifecycleActions id={asset.id} status={asset.status} /></div></div></div>;
}
