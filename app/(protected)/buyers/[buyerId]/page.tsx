import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requirePageRole } from "@/server/auth/page-guards";
import { getDiscoverableBuyer } from "@/server/services/buyer-discovery-service";
import { ContactBuyerForm } from "@/components/contact-buyer-form";
import { formatMoney, labelize } from "@/lib/utils";

export default async function BuyerDetailPage({ params }: { params: Promise<{ buyerId: string }> }) {
  const user = await requirePageRole("SELLER").catch(() => null);
  if (!user) redirect("/dashboard");
  const { buyerId } = await params;
  const buyer = await getDiscoverableBuyer(buyerId, user.id);
  if (!buyer) notFound();
  return <div className="noise min-h-screen"><div className="deal-shell max-w-[1080px]">
    <Link href="/buyers" className="focus-ring text-[10px] font-bold uppercase tracking-[.14em] text-[#7a817f] hover:text-[#b7653b]">← Back to buyers</Link>
    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]"><main><p className="eyebrow">{buyer.companyName}</p><h1 className="display compact-heading mt-3 text-[#172532]">{buyer.fullName}</h1><p className="mt-6 max-w-[660px] text-base leading-7 text-[#50606a]">{buyer.investmentThesis}</p><div className="mt-10 grid gap-px border border-[#d9d4c9] bg-[#d9d4c9] sm:grid-cols-3"><Metric label="Investment" value={`${formatMoney(buyer.investmentMin, "EUR")} - ${formatMoney(buyer.investmentMax, "EUR")}`} /><Metric label="Revenue" value={`${formatMoney(buyer.revenueMin, "EUR")} - ${formatMoney(buyer.revenueMax, "EUR")}`} /><Metric label="EBITDA" value={`${formatMoney(buyer.ebitdaMin, "EUR")} - ${formatMoney(buyer.ebitdaMax, "EUR")}`} /></div></main><aside className="market-panel h-fit p-6">{buyer.bestSellerAssetMatch?.match && <div className="mb-8 border border-[#cbd8d0] bg-[#edf4ef] p-4"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#5f816d]">Best owned-asset fit</p><p className="mt-2 text-2xl font-bold">{buyer.bestSellerAssetMatch.match.score}% · {buyer.bestSellerAssetMatch.match.level}</p><p className="mt-2 text-xs text-[#50606a]">{buyer.bestSellerAssetMatch.title}</p></div>}<ContactBuyerForm buyerId={buyer.id} /></aside></div>
    <div className="mt-10 flex flex-wrap gap-2">{[...buyer.categories.map((item) => labelize(item.category)), ...buyer.countries.map((item) => item.country), ...buyer.dealTypes.map((item) => labelize(item.dealType))].map((item) => <span key={item} className="deal-badge">{item}</span>)}</div>
  </div></div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="bg-[#fbfaf6] p-5"><p className="stat-label">{label}</p><p className="mt-2 text-sm font-bold text-[#172532]">{value}</p></div>; }
