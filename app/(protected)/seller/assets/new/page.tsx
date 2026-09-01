import Link from "next/link";
import { requirePageRole } from "@/server/auth/page-guards";
import { AssetForm } from "@/components/asset-form";

export default async function NewAssetPage() {
  await requirePageRole("SELLER");
  return <div className="min-h-screen"><div className="deal-shell max-w-[1160px]"><Link href="/seller/assets" className="focus-ring text-[10px] font-bold uppercase tracking-[.08em] text-[#6b7873] hover:text-[#0d6b53]">← Asset inventory</Link><div className="mt-6 border-b border-[#d8e1dd] pb-5"><p className="eyebrow">New opportunity / draft</p><h1 className="display compact-heading mt-2">Create asset listing</h1><p className="mt-3 max-w-[660px] text-sm leading-6 text-[#52615c]">Capture the identity, operating profile, financials and proposed transaction structure for Buyer review.</p></div><div className="market-panel mt-6 p-5 sm:p-7"><AssetForm mode="create" /></div></div></div>;
}
