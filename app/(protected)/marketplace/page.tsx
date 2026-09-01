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
  return <div className="noise min-h-screen"><div className="fine-grid absolute inset-0 opacity-50" aria-hidden="true" /><div className="market-shell">
    <div className="border-b border-[#d6d0c4] pb-5">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div><p className="eyebrow rise">Asset Listings / regulated supply</p><h1 className="display compact-heading mt-2 max-w-[760px] text-[#111a22] rise rise-delay">Find the right regulated deal flow.</h1></div>
        <div className="data-grid grid-cols-3 lg:min-w-[420px]">
          <HeaderMetric label="Active assets" value={String(pagination.total)} />
          <HeaderMetric label="Buyer role" value={user.role === "BUYER" ? "Smart Match" : "View only"} />
          <HeaderMetric label="Review state" value="Validated" />
        </div>
      </div>
      <nav aria-label="Marketplace categories" className="mt-5 flex gap-2 overflow-x-auto pb-1">
        <Link href={categoryHref(filters)} aria-current={!filters.category ? "page" : undefined} className={`focus-ring deal-badge shrink-0 ${!filters.category ? "status-live" : ""}`}>All ({pagination.total})</Link>
        {assetCategories.filter((category) => category !== "OTHER").map((category) => <Link key={category} href={categoryHref(filters, category)} aria-current={filters.category === category ? "page" : undefined} className={`focus-ring deal-badge shrink-0 ${filters.category === category ? "status-live" : ""}`}>{labelize(category)}</Link>)}
      </nav>
    </div>
    <div className="mt-6 grid gap-6 lg:grid-cols-[286px_1fr] lg:items-start">
      <MarketplaceFilters filters={filters} />
      {result.items.length === 0 ? <section className="border-b border-[#d9d4c9] py-20 text-center"><p className="eyebrow">No matches</p><h2 className="display mt-4 text-4xl tracking-[-.04em]">The room is quiet.</h2><p className="mx-auto mt-4 max-w-[380px] text-sm leading-6 text-[#50606a]">Try widening your search or resetting the filters to see every published opportunity.</p><Link href="/marketplace" className="focus-ring mt-7 inline-block border-b border-[#b7653b] pb-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#b7653b]">Reset filters ↗</Link></section> : <section aria-label="Marketplace listings">
        <div className="section-kicker mb-4"><div><p className="stat-label">Newest Listings</p><p className="mt-1 text-xs text-[#737a78]">Structured M&A records with price, status, jurisdiction, and match signal.</p></div><p className="text-[11px] text-[#737a78]">Page {pagination.page} of {pagination.pageCount || 1}</p></div>
        <div className="grid gap-3">{result.items.map((asset) => <AssetCard key={asset.id} asset={asset as unknown as AssetCardData} />)}</div>
        <div className="mt-8 flex items-center justify-between border-t border-[#d9d4c9] pt-5"><p className="text-[11px] text-[#7a817f]">{pagination.total} matching records</p><div className="flex gap-2">{pagination.page > 1 && <Link href={pageHref(filters, pagination.page - 1)} className="focus-ring action-ghost px-4 py-2 text-[10px] font-bold uppercase tracking-[.12em]">← Previous</Link>}{pagination.page < pagination.pageCount && <Link href={pageHref(filters, pagination.page + 1)} className="focus-ring action-primary px-4 py-2 text-[10px] font-bold uppercase tracking-[.12em]">Next →</Link>}</div></div>
      </section>}
    </div>
  </div></div>;
}

function HeaderMetric({ label, value }: { label: string; value: string }) {
  return <div className="data-cell"><p className="stat-label">{label}</p><p className="mt-1 text-sm font-extrabold text-[#111a22]">{value}</p></div>;
}
