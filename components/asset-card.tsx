import Link from "next/link";
import { formatMoney, labelize } from "@/lib/utils";

export type AssetCardData = {
  id: string; slug: string; title: string; category: string; country: string; description: string;
  askingPrice: string | null; currency: string; revenue: string | null; ebitda: string | null;
  dealType: string; businessStatus: string; status: string;
  createdAt?: string | Date; updatedAt?: string | Date;
  match?: { score: number; level: string; reasons: string[]; mismatches: string[] } | null;
};

export function AssetCard({ asset, management = false }: { asset: AssetCardData; management?: boolean }) {
  const statusClass = asset.status === "PUBLISHED" ? "status-live" : asset.status === "ARCHIVED" ? "status-muted" : "status-warning";
  const reference = `N5-${asset.id.slice(-6).toUpperCase()}`;
  const date = formatDate(asset.updatedAt ?? asset.createdAt);

  return <article className="ledger-row group overflow-hidden">
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d8e1dd] bg-[#f8faf9] px-4 py-2.5 sm:px-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-semibold uppercase tracking-[.06em] text-[#6b7873]">
        <span>Ref. {reference}</span>
        {date && <span>Updated {date}</span>}
      </div>
      <span className={`deal-badge ${statusClass}`}>{labelize(asset.status)}</span>
    </div>
    <div className="grid lg:grid-cols-[1fr_230px]">
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="deal-badge">{asset.country}</span>
          <span className="deal-badge">{labelize(asset.category)}</span>
          <span className="deal-badge">{asset.businessStatus}</span>
        </div>
        <p className="mt-3 stat-label">{labelize(asset.dealType)}</p>
        <h2 className="mt-1.5 text-xl font-semibold leading-7 text-[#101816] sm:text-[22px]">{asset.title}</h2>
        <p className="mt-2 line-clamp-2 max-w-[760px] text-sm leading-5 text-[#52615c]">{asset.description}</p>
        <div className="mt-4 grid grid-cols-2 border-y border-[#e1e7e4] sm:grid-cols-4">
          <Metric label="Revenue" value={formatMoney(asset.revenue, asset.currency)} />
          <Metric label="EBITDA" value={formatMoney(asset.ebitda, asset.currency)} />
          <Metric label="Jurisdiction" value={asset.country} />
          <Metric label="Structure" value={labelize(asset.dealType)} />
        </div>
        {asset.match && <div className="mt-4 border-l-2 border-[#0d6b53] bg-[#edf6f2] px-3 py-2.5">
          <div className="flex items-center justify-between gap-3"><span className="text-[10px] font-bold uppercase tracking-[.08em] text-[#176548]">Smart Match · {asset.match.level}</span><span className="text-lg font-bold text-[#101816]">{asset.match.score}%</span></div>
          <p className="mt-1 text-xs leading-5 text-[#52615c]">{asset.match.reasons[0] ?? asset.match.mismatches[0] ?? "Match calculated from your acquisition criteria."}</p>
        </div>}
      </div>
      <aside className="flex flex-col justify-between border-t border-[#d8e1dd] bg-[#fbfcfb] p-4 sm:p-5 lg:border-l lg:border-t-0">
        <div><p className="stat-label">Asking price</p><p className="mt-2 text-2xl font-bold text-[#101816]">{formatMoney(asset.askingPrice, asset.currency)}</p><p className="mt-1 text-[11px] text-[#6b7873]">Seller-provided indication</p></div>
        <div className="mt-5 grid gap-2">
          <Link href={management ? `/seller/assets/${asset.id}/edit` : `/assets/${asset.slug}`} className="focus-ring action-primary flex min-h-10 items-center justify-between px-3 text-[10px] font-bold uppercase tracking-[.08em]"><span>{management ? "Manage asset" : "View asset"}</span><span aria-hidden="true">→</span></Link>
          {!management && asset.match && <Link href={`/assets/${asset.slug}#contact`} className="focus-ring action-ghost flex min-h-10 items-center justify-between px-3 text-[10px] font-bold uppercase tracking-[.08em]"><span>Express interest</span><span aria-hidden="true">↗</span></Link>}
        </div>
      </aside>
    </div>
  </article>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 border-b border-r border-[#e1e7e4] py-2.5 pr-2 last:border-r-0 sm:border-b-0 sm:px-3 sm:first:pl-0"><p className="stat-label">{label}</p><p className="mt-1 truncate text-xs font-semibold text-[#101816] sm:text-sm">{value}</p></div>;
}

function formatDate(value?: string | Date): string {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}
