import Link from "next/link";
import { formatMoney, labelize } from "@/lib/utils";

export type AssetCardData = {
  id: string; slug: string; title: string; category: string; country: string; description: string;
  askingPrice: string | null; currency: string; revenue: string | null; ebitda: string | null;
  dealType: string; businessStatus: string; status: string;
  match?: { score: number; level: string; reasons: string[]; mismatches: string[] } | null;
};

export function AssetCard({ asset, management = false }: { asset: AssetCardData; management?: boolean }) {
  const statusClass = asset.status === "PUBLISHED" ? "status-live" : asset.status === "ARCHIVED" ? "status-muted" : "text-[#b7653b]";
  return <article className="group flex h-full flex-col border border-[#d9d4c9] bg-[#fbfaf6] transition-colors hover:border-[#b7653b]">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d9d4c9] px-5 py-4">
      <div className="flex flex-wrap items-center gap-2"><span className="deal-badge">{asset.country}</span><span className="deal-badge">{labelize(asset.category)}</span>{asset.businessStatus && <span className="deal-badge">{asset.businessStatus}</span>}</div>
      <span className={`deal-badge ${statusClass}`}>{labelize(asset.status)}</span>
    </div>
    <div className="flex flex-1 flex-col p-5 sm:p-6">
      <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-start">
        <div><p className="stat-label">{labelize(asset.dealType)}</p><h2 className="display mt-2 text-2xl leading-[.98] tracking-[-.04em] text-[#172532]">{asset.title}</h2></div>
        <div className="border-l-2 border-[#b7653b] pl-4 sm:min-w-[145px] sm:text-right"><p className="stat-label">Asking Price</p><p className="mt-1 text-xl font-bold tracking-[-.02em] text-[#172532]">{formatMoney(asset.askingPrice, asset.currency)}</p></div>
      </div>
      {asset.match && <div className="mt-5 flex items-center justify-between border border-[#cbd8d0] bg-[#edf4ef] px-3 py-2"><span className="text-[10px] font-bold uppercase tracking-[.13em] text-[#5f816d]">{asset.match.level} match</span><span className="text-lg font-bold text-[#172532]">{asset.match.score}%</span></div>}
      <p className="mt-5 line-clamp-3 text-sm leading-6 text-[#50606a]">{asset.description}</p>
      <div className="mt-6 grid grid-cols-2 gap-px border border-[#d9d4c9] bg-[#d9d4c9]">
        <Metric label="Revenue" value={formatMoney(asset.revenue, asset.currency)} />
        <Metric label="EBITDA" value={formatMoney(asset.ebitda, asset.currency)} />
      </div>
    </div>
    <Link href={management ? `/seller/assets/${asset.id}/edit` : `/assets/${asset.slug}`} className="focus-ring flex items-center justify-between border-t border-[#d9d4c9] px-5 py-3 text-[10px] font-bold uppercase tracking-[.14em] text-[#50606a] transition-colors hover:bg-[#172532] hover:text-[#f4f1ea]"><span>{management ? "Manage asset" : "View opportunity"}</span><span className="transition-transform group-hover:translate-x-1">↗</span></Link>
  </article>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="bg-[#fbfaf6] p-3"><p className="stat-label">{label}</p><p className="mt-1 text-sm font-bold text-[#172532]">{value}</p></div>;
}
