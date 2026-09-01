import Link from "next/link";
import { requirePageRole } from "@/server/auth/page-guards";
import { getBuyerProfile } from "@/server/services/buyer-service";
import { BuyerProfileForm } from "@/components/buyer-profile-form";

export default async function BuyerProfilePage() {
  const user = await requirePageRole("BUYER");
  const profile = await getBuyerProfile(user.id);
  return <div className="noise min-h-screen"><div className="deal-shell max-w-[1120px]"><Link href="/dashboard" className="focus-ring text-[10px] font-bold uppercase tracking-[.14em] text-[#7a817f] hover:text-[#b7653b]">← Back to overview</Link><div className="mt-10 border-b border-[#d9d4c9] pb-7"><p className="eyebrow">Buyer profile / acquisition brief</p><h1 className="display compact-heading mt-3">Make the brief specific.</h1><p className="mt-5 max-w-[520px] text-sm leading-6 text-[#50606a]">Your private criteria create the frame for match scores, target geographies, and deal sizing.</p></div><div className="market-panel mt-8 max-w-[900px] p-5 sm:p-7"><BuyerProfileForm profile={profile} /></div></div></div>;
}
