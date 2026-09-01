import Link from "next/link";
import { requirePageRole } from "@/server/auth/page-guards";
import { AssetForm } from "@/components/asset-form";

export default async function NewAssetPage() {
  await requirePageRole("SELLER");
  return <div className="noise min-h-screen"><div className="deal-shell max-w-[960px]"><Link href="/seller/assets" className="focus-ring text-[10px] font-bold uppercase tracking-[.14em] text-[#7a817f] hover:text-[#b7653b]">← Back to your assets</Link><div className="mt-10 border-b border-[#d9d4c9] pb-7"><p className="eyebrow">New opportunity / Draft</p><h1 className="display compact-heading mt-3">Shape the asset brief.</h1><p className="mt-5 max-w-[520px] text-sm leading-6 text-[#50606a]">A strong listing starts with jurisdiction, price, financials, transaction structure, and a concise business overview.</p></div><div className="market-panel mt-8 p-5 sm:p-7"><AssetForm mode="create" /></div></div></div>;
}
