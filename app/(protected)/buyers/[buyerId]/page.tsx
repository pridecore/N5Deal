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
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d6d0c4] pb-4"><Link href="/buyers" className="focus-ring text-[10px] font-bold uppercase tracking-[.14em] text-[#737a78] hover:text-[#a85834]">← Back to buyers</Link><span className="deal-badge status-live">Active buyer profile</span></div>
    <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
      <main>
        <p className="eyebrow">{buyer.companyName}</p><h1 className="display compact-heading mt-2 text-[#111a22]">{buyer.fullName}</h1>
        <section className="mt-6 border-y border-[#d6d0c4] bg-[#fffefa] p-5"><p className="eyebrow">Acquisition thesis</p><p className="mt-4 max-w-[700px] text-base leading-7 text-[#485862]">{buyer.investmentThesis}</p></section>
        <div className="data-grid mt-7 grid-cols-1 sm:grid-cols-3"><Metric label="Investment" value={`${formatMoney(buyer.investmentMin, "EUR")} - ${formatMoney(buyer.investmentMax, "EUR")}`} /><Metric label="Revenue" value={`${formatMoney(buyer.revenueMin, "EUR")} - ${formatMoney(buyer.revenueMax, "EUR")}`} /><Metric label="EBITDA" value={`${formatMoney(buyer.ebitdaMin, "EUR")} - ${formatMoney(buyer.ebitdaMax, "EUR")}`} /></div>
        <div className="mt-7 grid gap-5 md:grid-cols-3"><ChipList label="Target sectors" items={buyer.categories.map((item) => labelize(item.category))} /><ChipList label="Geographies" items={buyer.countries.map((item) => item.country)} /><ChipList label="Deal types" items={buyer.dealTypes.map((item) => labelize(item.dealType))} /></div>
      </main>
      <aside className="market-panel h-fit p-5 lg:sticky lg:top-6">{buyer.bestSellerAssetMatch?.match && <div className="mb-6 border border-[#c7d8ce] bg-[#edf6f1] p-4"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#416f58]">Best owned-asset fit</p><p className="mt-2 text-3xl font-bold">{buyer.bestSellerAssetMatch.match.score}% · {buyer.bestSellerAssetMatch.match.level}</p><p className="mt-2 text-xs text-[#485862]">{buyer.bestSellerAssetMatch.title}</p></div>}<ContactBuyerForm buyerId={buyer.id} /></aside>
    </div>
  </div></div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="data-cell"><p className="stat-label">{label}</p><p className="mt-2 text-sm font-bold text-[#111a22]">{value}</p></div>; }

function ChipList({ label, items }: { label: string; items: string[] }) {
  return <section><p className="stat-label">{label}</p><div className="mt-3 flex flex-wrap gap-2">{items.map((item) => <span key={item} className="deal-badge">{item}</span>)}</div></section>;
}
