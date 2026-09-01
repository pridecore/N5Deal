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
  return <div className="min-h-screen"><div className="deal-shell max-w-[1160px]"><div className="flex items-center justify-between gap-4"><Link href="/seller/assets" className="focus-ring text-[10px] font-bold uppercase tracking-[.08em] text-[#6b7873] hover:text-[#0d6b53]">← Asset inventory</Link><span className={`deal-badge ${asset.status === "PUBLISHED" ? "status-live" : asset.status === "SUSPENDED" ? "status-warning" : ""}`}>{asset.status.toLowerCase()}</span></div><div className="mt-6 border-b border-[#d8e1dd] pb-5"><p className="eyebrow">Asset listing / edit</p><h1 className="display compact-heading mt-2">Edit opportunity</h1></div><div className="market-panel mt-6 p-5 sm:p-7"><AssetForm mode="edit" asset={defaults} /></div><div className="mt-6 border-t border-[#d8e1dd] pt-5"><p className="mb-3 stat-label">Lifecycle controls</p><AssetLifecycleActions id={asset.id} status={asset.status} /></div></div></div>;
}
