import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/server/services/auth-service";
import { getAssetDetails } from "@/server/services/asset-service";
import { formatMoney, labelize } from "@/lib/utils";
import { ContactAssetForm } from "@/components/contact-asset-form";

type SellerSummary = { companyName: string; fullName: string; bio?: string };

export default async function AssetDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { slug } = await params;
  let asset: Awaited<ReturnType<typeof getAssetDetails>>;
  try { asset = await getAssetDetails(slug, user); } catch { notFound(); }
  const seller = asset.seller as SellerSummary;
  const reference = `N5-${String(asset.id).slice(-6).toUpperCase()}`;
  const statusClass = asset.status === "PUBLISHED" ? "status-live" : asset.status === "SUSPENDED" ? "status-warning" : "status-muted";
  const updated = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(asset.updatedAt as string | Date));

  return <div className="min-h-screen"><div className="deal-shell">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d8e1dd] pb-3">
      <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[.06em] text-[#6b7873]"><Link href="/marketplace" className="focus-ring hover:text-[#0d6b53]">Marketplace</Link><span aria-hidden="true">/</span><span>{reference}</span><span aria-hidden="true">/</span><span>Updated {updated}</span></div>
      <span className={`deal-badge ${statusClass}`}>{labelize(asset.status as string)}</span>
    </div>

    <div className="mt-6 grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <main className="min-w-0">
        <div className="flex flex-wrap items-center gap-2"><span className="deal-badge">{asset.country as string}</span><span className="deal-badge">{labelize(asset.category as string)}</span><span className="deal-badge">{asset.businessStatus as string}</span><span className="deal-badge">{labelize(asset.dealType as string)}</span></div>
        <div className="mt-4 grid gap-5 border-b border-[#d8e1dd] pb-6 md:grid-cols-[1fr_auto] md:items-end">
          <div><p className="eyebrow">Opportunity brief</p><h1 className="mt-2 max-w-[760px] text-[clamp(1.9rem,4vw,3.1rem)] font-semibold leading-[1.08] text-[#101816]">{asset.title as string}</h1></div>
          <div className="border-l-2 border-[#0d6b53] pl-4 md:min-w-[230px] md:text-right"><p className="stat-label">Asking price</p><p className="price-figure mt-2">{formatMoney(asset.askingPrice as string | null, asset.currency as string)}</p><p className="mt-1 text-[11px] text-[#6b7873]">Seller-provided indication</p></div>
        </div>

        <div className="data-grid mt-5 grid-cols-2 md:grid-cols-4"><Metric label="Jurisdiction" value={asset.country as string} /><Metric label="Category" value={labelize(asset.category as string)} /><Metric label="Business status" value={asset.businessStatus as string} /><Metric label="Deal structure" value={labelize(asset.dealType as string)} /></div>

        <Section title="Business overview" note="Information supplied by the seller">
          <p className="max-w-[800px] whitespace-pre-wrap text-[15px] leading-7 text-[#40504b]">{asset.description as string}</p>
        </Section>

        <Section title="Financial overview" note="Indicative seller-provided figures">
          <div className="data-grid grid-cols-1 sm:grid-cols-3"><Metric label="Annual revenue" value={formatMoney(asset.revenue as string | null, asset.currency as string)} /><Metric label="EBITDA" value={formatMoney(asset.ebitda as string | null, asset.currency as string)} /><Metric label="Asking price" value={formatMoney(asset.askingPrice as string | null, asset.currency as string)} /></div>
        </Section>

        <Section title="Classification and deal terms" note="No independent regulatory verification is implied">
          <dl className="divide-y divide-[#e1e7e4] border-y border-[#d8e1dd] bg-white">
            <DetailRow label="Marketplace category" value={labelize(asset.category as string)} />
            <DetailRow label="Primary jurisdiction" value={asset.country as string} />
            <DetailRow label="Transaction structure" value={labelize(asset.dealType as string)} />
            <DetailRow label="Disclosure basis" value="Seller-provided marketplace information" />
          </dl>
        </Section>

        {asset.match && <Section title="Buyer Smart Match" note="Calculated from your saved acquisition criteria">
          <div className="border border-[#b7d8ca] bg-[#edf6f2] p-4 sm:p-5"><div className="flex items-center justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[#176548]">{asset.match.level} alignment</p><p className="mt-1 text-xs text-[#52615c]">Deterministic criteria comparison</p></div><p className="text-3xl font-bold text-[#101816]">{asset.match.score}%</p></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><MatchList title="Aligned criteria" items={asset.match.reasons} /><MatchList title="Points to review" items={asset.match.mismatches} /></div></div>
        </Section>}
      </main>

      <aside id="contact" className="market-panel h-fit overflow-hidden lg:sticky lg:top-[92px]">
        <div className="border-b border-[#d8e1dd] bg-[#f8faf9] p-5"><p className="stat-label">Presented by</p><p className="mt-2 text-base font-bold text-[#101816]">{seller.companyName}</p><p className="mt-1 text-xs text-[#6b7873]">{seller.fullName}</p>{seller.bio && <p className="mt-3 text-xs leading-5 text-[#52615c]">{seller.bio}</p>}</div>
        <div className="p-5">{user.role === "BUYER" ? <><p className="text-sm font-bold">Discuss this opportunity</p><p className="mt-1 text-xs leading-5 text-[#6b7873]">Start a private platform conversation with the seller.</p><ContactAssetForm assetId={asset.id as string} /></> : <><p className="text-sm font-bold">Buyer-only contact</p><p className="mt-2 text-xs leading-5 text-[#6b7873]">Buyer accounts can express interest and start a private conversation from this brief.</p></>}</div>
      </aside>
    </div>
  </div></div>;
}

function Section({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return <section className="mt-8"><div className="section-kicker mb-4"><h2 className="text-sm font-bold text-[#101816]">{title}</h2><p className="hidden text-[11px] text-[#6b7873] sm:block">{note}</p></div>{children}</section>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="data-cell"><p className="stat-label">{label}</p><p className="mt-1.5 text-sm font-semibold leading-5 text-[#101816]">{value}</p></div>; }

function DetailRow({ label, value }: { label: string; value: string }) { return <div className="grid gap-1 px-4 py-3 sm:grid-cols-[210px_1fr] sm:gap-6"><dt className="stat-label">{label}</dt><dd className="text-sm font-medium text-[#26332f]">{value}</dd></div>; }

function MatchList({ title, items }: { title: string; items: string[] }) { return <div><p className="stat-label">{title}</p>{items.length > 0 ? <ul className="mt-2 space-y-1.5 text-xs leading-5 text-[#40504b]">{items.slice(0, 4).map((item) => <li key={item} className="flex gap-2"><span aria-hidden="true">•</span><span>{item}</span></li>)}</ul> : <p className="mt-2 text-xs text-[#6b7873]">None recorded.</p>}</div>; }
