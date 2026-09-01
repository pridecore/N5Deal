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
  return <div className="min-h-screen"><div className="deal-shell max-w-[1120px]">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d8e1dd] pb-3"><Link href="/buyers" className="focus-ring text-[10px] font-bold uppercase tracking-[.08em] text-[#6b7873] hover:text-[#0d6b53]">← Buyer discovery</Link><span className="deal-badge status-live">Active buyer</span></div>
    <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
      <main>
        <p className="eyebrow">{buyer.companyName}</p><h1 className="display compact-heading mt-2 text-[#101816]">{buyer.fullName}</h1>
        <section className="mt-5 border-y border-[#d8e1dd] bg-white p-5"><p className="stat-label">Acquisition thesis</p><p className="mt-3 max-w-[700px] text-[15px] leading-7 text-[#40504b]">{buyer.investmentThesis}</p></section>
        <div className="data-grid mt-7 grid-cols-1 sm:grid-cols-3"><Metric label="Investment" value={`${formatMoney(buyer.investmentMin, "EUR")} - ${formatMoney(buyer.investmentMax, "EUR")}`} /><Metric label="Revenue" value={`${formatMoney(buyer.revenueMin, "EUR")} - ${formatMoney(buyer.revenueMax, "EUR")}`} /><Metric label="EBITDA" value={`${formatMoney(buyer.ebitdaMin, "EUR")} - ${formatMoney(buyer.ebitdaMax, "EUR")}`} /></div>
        <div className="mt-7 grid gap-5 md:grid-cols-3"><ChipList label="Target sectors" items={buyer.categories.map((item) => labelize(item.category))} /><ChipList label="Geographies" items={buyer.countries.map((item) => item.country)} /><ChipList label="Deal types" items={buyer.dealTypes.map((item) => labelize(item.dealType))} /></div>
      </main>
      <aside className="market-panel h-fit p-5 lg:sticky lg:top-[92px]">{buyer.bestSellerAssetMatch?.match && <div className="mb-6 border border-[#b7d8ca] bg-[#edf6f2] p-4"><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[#176548]">Best owned-asset fit</p><p className="mt-2 text-2xl font-bold">{buyer.bestSellerAssetMatch.match.score}% · {buyer.bestSellerAssetMatch.match.level}</p><p className="mt-2 text-xs text-[#52615c]">{buyer.bestSellerAssetMatch.title}</p></div>}<ContactBuyerForm buyerId={buyer.id} /></aside>
    </div>
  </div></div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="data-cell"><p className="stat-label">{label}</p><p className="mt-2 text-sm font-semibold text-[#101816]">{value}</p></div>; }

function ChipList({ label, items }: { label: string; items: string[] }) {
  return <section><p className="stat-label">{label}</p><div className="mt-3 flex flex-wrap gap-2">{items.map((item) => <span key={item} className="deal-badge">{item}</span>)}</div></section>;
}
