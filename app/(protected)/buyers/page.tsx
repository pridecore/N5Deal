import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePageRole } from "@/server/auth/page-guards";
import { buyerDiscoveryQuerySchema } from "@/validation/buyers";
import { assetCategories, dealTypes } from "@/validation/assets";
import { listDiscoverableBuyers } from "@/server/services/buyer-discovery-service";
import { labelize } from "@/lib/utils";

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
  return <div className="noise min-h-screen"><div className="deal-shell">
    <div className="border-b border-[#d9d4c9] pb-7"><p className="eyebrow">Buyer discovery / demand</p><h1 className="display compact-heading mt-3 text-[#172532]">Qualified acquisition demand.</h1><p className="mt-5 max-w-[560px] text-sm leading-6 text-[#50606a]">Buyer intent shown as investment criteria, geography, transaction range, and compatibility with your owned assets.</p></div>
    <form action="/buyers" className="market-panel mt-7 grid gap-4 p-5 md:grid-cols-4"><input name="search" defaultValue={filters.search ?? ""} placeholder="Search buyers" className="focus-ring field-line" /><select name="category" defaultValue={filters.category ?? ""} className="focus-ring field-line"><option value="">All categories</option>{assetCategories.map((item) => <option key={item} value={item}>{labelize(item)}</option>)}</select><select name="dealType" defaultValue={filters.dealType ?? ""} className="focus-ring field-line"><option value="">All deal types</option>{dealTypes.map((item) => <option key={item} value={item}>{labelize(item)}</option>)}</select><button className="focus-ring action-primary px-5 text-[10px] font-bold uppercase tracking-[.14em]">Filter buyers</button></form>
    <div className="mt-7 grid gap-4 md:grid-cols-2">{result.items.map((buyer) => <Link key={buyer.id} href={`/buyers/${buyer.id}`} className="focus-ring border border-[#d9d4c9] bg-[#fbfaf6] p-5 transition-colors hover:border-[#b7653b]"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">{buyer.companyName}</p><h2 className="display mt-3 text-3xl tracking-[-.05em] text-[#172532]">{buyer.fullName}</h2></div>{buyer.bestSellerAssetMatch?.match && <div className="border-l-2 border-[#5f816d] pl-4 text-right"><p className="text-2xl font-bold text-[#172532]">{buyer.bestSellerAssetMatch.match.score}%</p><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#5f816d]">Best fit</p></div>}</div><p className="mt-5 line-clamp-3 text-sm leading-6 text-[#50606a]">{buyer.investmentThesis}</p><p className="mt-5 border-t border-[#d9d4c9] pt-4 text-[10px] font-bold uppercase tracking-[.12em] text-[#b7653b]">View profile ↗</p></Link>)}</div>
  </div></div>;
}
