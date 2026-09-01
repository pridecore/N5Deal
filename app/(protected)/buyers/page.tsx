import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePageRole } from "@/server/auth/page-guards";
import { buyerDiscoveryQuerySchema } from "@/validation/buyers";
import { assetCategories, dealTypes } from "@/validation/assets";
import { listDiscoverableBuyers } from "@/server/services/buyer-discovery-service";
import { formatMoney, labelize } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function parseParams(params: Record<string, string | string[] | undefined>) {
  const raw = Object.fromEntries(Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]).filter(([, value]) => value !== undefined && value !== ""));
  const result = buyerDiscoveryQuerySchema.safeParse(raw);
  return result.success ? result.data : buyerDiscoveryQuerySchema.parse({});
}

export default async function BuyersPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requirePageRole("SELLER").catch(() => null);
  if (!user) redirect("/dashboard");
  const filters = parseParams(await searchParams);
  const result = await listDiscoverableBuyers(filters, user.id);
  return <div className="min-h-screen"><div className="deal-shell">
    <div className="border-b border-[#d8e1dd] pb-5"><div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><p className="eyebrow">Buyer discovery / active demand</p><h1 className="display compact-heading mt-2 text-[#101816]">Qualified acquisition mandates</h1><p className="mt-3 max-w-[680px] text-sm leading-6 text-[#52615c]">Compare investor thesis, target sectors, geographies and financial ranges against your current asset inventory.</p></div><div className="data-grid min-w-[220px] grid-cols-2"><Metric label="Buyer profiles" value={String(result.pagination.total)} /><Metric label="Access" value="Seller" /></div></div></div>
    <form action="/buyers" className="market-panel mt-5 grid gap-3 p-4 md:grid-cols-[1.5fr_1fr_1fr_auto]"><label><span className="sr-only">Search buyers</span><input name="search" defaultValue={filters.search ?? ""} placeholder="Search company, buyer or thesis" className="focus-ring field-line" /></label><label><span className="sr-only">Category</span><select name="category" defaultValue={filters.category ?? ""} className="focus-ring field-line"><option value="">All categories</option>{assetCategories.map((item) => <option key={item} value={item}>{labelize(item)}</option>)}</select></label><label><span className="sr-only">Deal type</span><select name="dealType" defaultValue={filters.dealType ?? ""} className="focus-ring field-line"><option value="">All deal types</option>{dealTypes.map((item) => <option key={item} value={item}>{labelize(item)}</option>)}</select></label><button className="focus-ring action-primary h-11 px-5 text-[10px] font-bold uppercase tracking-[.08em]">Apply filters</button></form>
    <div className="mt-5 grid gap-3">{result.items.map((buyer) => <Link key={buyer.id} href={`/buyers/${buyer.id}`} className="focus-ring ledger-row grid gap-5 p-4 sm:p-5 md:grid-cols-[1.15fr_1fr_220px] md:items-start">
      <div><p className="eyebrow">{buyer.companyName}</p><h2 className="mt-1.5 text-xl font-semibold text-[#101816]">{buyer.fullName}</h2><p className="mt-3 line-clamp-3 text-sm leading-6 text-[#52615c]">{buyer.investmentThesis}</p></div>
      <div className="space-y-3"><ChipList label="Sectors" items={buyer.categories.map((item) => labelize(item.category))} /><ChipList label="Geographies" items={buyer.countries.map((item) => item.country)} /><ChipList label="Deal type" items={buyer.dealTypes.map((item) => labelize(item.dealType))} /></div>
      <div className="border-l border-[#d8e1dd] pl-4">
        {buyer.bestSellerAssetMatch?.match && <Metric label="Best owned-asset fit" value={`${buyer.bestSellerAssetMatch.match.score}%`} />}
        <Metric label="Investment range" value={`${formatMoney(buyer.investmentMin, "EUR")} - ${formatMoney(buyer.investmentMax, "EUR")}`} />
        <Metric label="Revenue target" value={`${formatMoney(buyer.revenueMin, "EUR")} - ${formatMoney(buyer.revenueMax, "EUR")}`} />
        <p className="mt-3 flex items-center justify-between border-t border-[#d8e1dd] pt-3 text-[10px] font-bold uppercase tracking-[.08em] text-[#0d6b53]">View buyer mandate <span>→</span></p>
      </div>
    </Link>)}</div>
  </div></div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="mb-3"><p className="stat-label">{label}</p><p className="mt-1 text-sm font-semibold text-[#101816]">{value}</p></div>; }

function ChipList({ label, items }: { label: string; items: string[] }) {
  return <div><p className="stat-label">{label}</p><div className="mt-2 flex flex-wrap gap-2">{items.slice(0, 4).map((item) => <span key={item} className="deal-badge">{item}</span>)}</div></div>;
}
