import Link from "next/link";
import { redirect } from "next/navigation";
import { assetCategories, assetQuerySchema } from "@/validation/assets";
import { getCurrentUser } from "@/server/services/auth-service";
import { getPublishedAssets } from "@/server/services/asset-service";
import { AssetCard, type AssetCardData } from "@/components/asset-card";
import { MarketplaceFilters } from "@/components/marketplace-filters";
import { labelize } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function parseParams(params: Record<string, string | string[] | undefined>) {
  const raw = Object.fromEntries(Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]).filter(([, value]) => value !== undefined && value !== ""));
  const result = assetQuerySchema.safeParse(raw);
  return result.success ? result.data : assetQuerySchema.parse({});
}

function pageHref(filters: ReturnType<typeof parseParams>, page: number): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...filters, page })) if (value !== undefined && value !== "" && value !== 0) params.set(key, String(value));
  return `/marketplace?${params.toString()}`;
}

function categoryHref(filters: ReturnType<typeof parseParams>, category?: string): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...filters, category, page: 1 })) if (value !== undefined && value !== "" && value !== 0) params.set(key, String(value));
  return `/marketplace?${params.toString()}`;
}

export default async function MarketplacePage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const filters = parseParams(await searchParams);
  const result = await getPublishedAssets(filters, user);
  const { pagination } = result;
  return <div className="min-h-screen"><div className="market-shell">
    <div className="border-b border-[#d8e1dd] pb-5">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div><p className="eyebrow rise">Marketplace / active supply</p><h1 className="display compact-heading mt-2 text-[#101816] rise rise-delay">Financial businesses and regulated asset opportunities</h1><p className="mt-3 max-w-[690px] text-sm leading-6 text-[#52615c]">Review seller-provided commercial, financial and jurisdiction data. Buyer accounts receive Smart Match context from their acquisition criteria.</p></div>
        <div className="data-grid grid-cols-3 lg:min-w-[390px]">
          <HeaderMetric label="Results" value={String(pagination.total)} />
          <HeaderMetric label="Access" value={user.role === "BUYER" ? "Buyer" : labelize(user.role)} />
          <HeaderMetric label="Sort" value={labelize(filters.sort)} />
        </div>
      </div>
      <nav aria-label="Marketplace categories" className="mt-5 flex overflow-x-auto border border-[#d8e1dd] bg-white">
        <Link href={categoryHref(filters)} aria-current={!filters.category ? "page" : undefined} className={`focus-ring shrink-0 border-r border-[#d8e1dd] px-4 py-2.5 text-xs font-semibold ${!filters.category ? "bg-[#084c3c] text-white" : "text-[#52615c] hover:bg-[#eef3f0]"}`}>All <span className="ml-1 opacity-65">{pagination.total}</span></Link>
        {assetCategories.filter((category) => category !== "OTHER").map((category) => <Link key={category} href={categoryHref(filters, category)} aria-current={filters.category === category ? "page" : undefined} className={`focus-ring shrink-0 border-r border-[#d8e1dd] px-4 py-2.5 text-xs font-semibold last:border-0 ${filters.category === category ? "bg-[#084c3c] text-white" : "text-[#52615c] hover:bg-[#eef3f0]"}`}>{labelize(category)}</Link>)}
      </nav>
    </div>
    <div className="mt-5 grid gap-5 xl:grid-cols-[270px_1fr] xl:items-start">
      <MarketplaceFilters filters={filters} />
      {result.items.length === 0 ? <section className="border border-[#d8e1dd] bg-white py-16 text-center"><p className="eyebrow">No matching assets</p><h2 className="mt-3 text-2xl font-semibold">Adjust the current criteria</h2><p className="mx-auto mt-3 max-w-[380px] text-sm leading-6 text-[#52615c]">Widen the price, country or category filters to return more published opportunities.</p><Link href="/marketplace" className="focus-ring action-ghost mt-6 inline-flex h-10 items-center px-4 text-[10px] font-bold uppercase tracking-[.08em]">Reset filters</Link></section> : <section aria-label="Marketplace listings">
        <div className="section-kicker mb-3"><div><p className="text-sm font-bold text-[#101816]">Available opportunities</p><p className="mt-1 text-xs text-[#6b7873]">Seller-provided records with price, lifecycle status and match context.</p></div><p className="shrink-0 text-[11px] text-[#6b7873]">Page {pagination.page} of {pagination.pageCount || 1}</p></div>
        <div className="grid gap-3">{result.items.map((asset) => <AssetCard key={asset.id} asset={asset as unknown as AssetCardData} />)}</div>
        <div className="mt-6 flex items-center justify-between border-t border-[#d8e1dd] pt-4"><p className="text-[11px] text-[#6b7873]">{pagination.total} matching records</p><div className="flex gap-2">{pagination.page > 1 && <Link href={pageHref(filters, pagination.page - 1)} className="focus-ring action-ghost px-4 py-2 text-[10px] font-bold uppercase tracking-[.08em]">← Previous</Link>}{pagination.page < pagination.pageCount && <Link href={pageHref(filters, pagination.page + 1)} className="focus-ring action-primary px-4 py-2 text-[10px] font-bold uppercase tracking-[.08em]">Next →</Link>}</div></div>
      </section>}
    </div>
  </div></div>;
}

function HeaderMetric({ label, value }: { label: string; value: string }) {
  return <div className="data-cell"><p className="stat-label">{label}</p><p className="mt-1 text-sm font-bold text-[#101816]">{value}</p></div>;
}
