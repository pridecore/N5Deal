import Link from "next/link";
import { requirePageRole } from "@/server/auth/page-guards";
import { getBuyerProfile } from "@/server/services/buyer-service";
import { BuyerProfileForm } from "@/components/buyer-profile-form";

export default async function BuyerProfilePage() {
  const user = await requirePageRole("BUYER");
  const profile = await getBuyerProfile(user.id);
  return <div className="min-h-screen"><div className="deal-shell max-w-[1160px]"><Link href="/dashboard" className="focus-ring text-[10px] font-bold uppercase tracking-[.08em] text-[#6b7873] hover:text-[#0d6b53]">← Overview</Link><div className="mt-6 border-b border-[#d8e1dd] pb-5"><p className="eyebrow">Buyer profile / acquisition mandate</p><h1 className="display compact-heading mt-2">Acquisition criteria</h1><p className="mt-3 max-w-[620px] text-sm leading-6 text-[#52615c]">Define the sectors, markets and financial envelope used to calculate marketplace Smart Match scores.</p></div><div className="market-panel mt-6 p-5 sm:p-7"><BuyerProfileForm profile={profile} /></div></div></div>;
}
