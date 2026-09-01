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
  const statusClass = asset.status === "PUBLISHED" ? "status-live" : asset.status === "ARCHIVED" ? "status-muted" : "text-[#b7653b]";
  const reference = `#${asset.id.slice(-6).toUpperCase()}`;
  const date = formatDate(asset.updatedAt ?? asset.createdAt);
  const topDeal = asset.match ? asset.match.score >= 85 : asset.status === "PUBLISHED" && Number(asset.askingPrice ?? 0) >= 20_000_000;
  return <article className="ledger-row group flex h-full flex-col">
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#d6d0c4] bg-[#f7f3eb] px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        {topDeal && <span className="deal-badge status-warning">Top deal</span>}
        <span className="deal-badge">Asset ID {reference}</span>
        {date && <span className="deal-badge">Updated {date}</span>}
      </div>
      <span className={`deal-badge ${statusClass}`}>Validated · {labelize(asset.status)}</span>
    </div>
    <div className="flex flex-1 flex-col p-4 sm:p-5">
      <div className="grid gap-5 md:grid-cols-[1fr_190px] md:items-start">
        <div>
          <div className="flex flex-wrap gap-2"><span className="deal-badge">{asset.country}</span><span className="deal-badge">{labelize(asset.category)}</span><span className="deal-badge">{asset.businessStatus}</span></div>
          <p className="mt-4 stat-label">{labelize(asset.dealType)}</p>
          <h2 className="display mt-2 text-2xl leading-[1] tracking-[-.035em] text-[#111a22]">{asset.title}</h2>
        </div>
        <div className="border-l-2 border-[#a85834] pl-4 md:text-right">
          <p className="stat-label">Asking Price</p>
          <p className="mt-2 text-2xl font-extrabold tracking-[-.03em] text-[#111a22]">{formatMoney(asset.askingPrice, asset.currency)}</p>
          <p className="mt-2 text-[11px] text-[#737a78]">Indicative seller ask</p>
        </div>
      </div>
      {asset.match && <div className="mt-4 border border-[#c7d8ce] bg-[#edf6f1] px-3 py-2">
        <div className="flex items-center justify-between gap-3"><span className="text-[10px] font-bold uppercase tracking-[.13em] text-[#416f58]">Buyer Smart Match · {asset.match.level}</span><span className="text-xl font-bold text-[#111a22]">{asset.match.score}%</span></div>
        {asset.match.reasons[0] && <p className="mt-1 text-xs leading-5 text-[#485862]">{asset.match.reasons[0]}</p>}
      </div>}
      <p className="mt-5 line-clamp-3 text-sm leading-6 text-[#50606a]">{asset.description}</p>
      <div className="data-grid mt-5 grid-cols-2">
        <Metric label="Revenue" value={formatMoney(asset.revenue, asset.currency)} />
        <Metric label="EBITDA" value={formatMoney(asset.ebitda, asset.currency)} />
      </div>
    </div>
    <Link href={management ? `/seller/assets/${asset.id}/edit` : `/assets/${asset.slug}`} className="focus-ring flex items-center justify-between border-t border-[#d6d0c4] px-4 py-3 text-[10px] font-bold uppercase tracking-[.14em] text-[#485862] transition-colors hover:bg-[#111a22] hover:text-[#f3f0e8]"><span>{management ? "Manage asset" : "View opportunity"}</span><span className="transition-transform group-hover:translate-x-1">↗</span></Link>
  </article>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="data-cell"><p className="stat-label">{label}</p><p className="mt-1 text-sm font-bold text-[#111a22]">{value}</p></div>;
}

function formatDate(value?: string | Date): string {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(new Date(value));
}
