import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePageRole } from "@/server/auth/page-guards";
import { getManagerMetrics, listAuditEvents, listManagerAssets, listManagerUsers } from "@/server/services/manager-service";
import { managerAssetQuerySchema, managerUserQuerySchema } from "@/validation/manager";
import { formatMoney, labelize } from "@/lib/utils";
import { ModerationActionButton } from "@/components/moderation-action-button";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const mobileCellLabel = "before:mb-1 before:block before:text-[9px] before:font-bold before:uppercase before:tracking-[.08em] before:text-[#77837e] before:content-[attr(data-label)] sm:before:hidden";
const stackedCell = `block px-4 py-3 ${mobileCellLabel} sm:table-cell`;
const stackedMetaCell = `flex items-center justify-between gap-4 px-4 py-2 ${mobileCellLabel} sm:table-cell sm:py-3`;

function value(params: Record<string, string | string[] | undefined>, key: string) {
  const entry = params[key];
  return Array.isArray(entry) ? entry[0] : entry;
}

export default async function ManagerPage({ searchParams }: { searchParams: SearchParams }) {
  const manager = await requirePageRole("MANAGER").catch(() => null);
  if (!manager) redirect("/dashboard");
  const params = await searchParams;
  const userFilters = managerUserQuerySchema.parse({ search: value(params, "userSearch") || undefined, role: value(params, "role") || undefined, status: value(params, "userStatus") || undefined, page: 1, pageSize: 12 });
  const assetFilters = managerAssetQuerySchema.parse({ search: value(params, "assetSearch") || undefined, status: value(params, "assetStatus") || undefined, category: value(params, "category") || undefined, page: 1, pageSize: 12 });
  const [metrics, users, assets, audit] = await Promise.all([getManagerMetrics(), listManagerUsers(userFilters), listManagerAssets(assetFilters), listAuditEvents()]);

  return <div className="min-h-screen"><div className="market-shell max-w-[1440px]">
    <header className="border-b border-[#d8e1dd] pb-5"><p className="eyebrow">Manager / marketplace governance</p><h1 className="display compact-heading mt-2">Operations console</h1><p className="mt-3 max-w-[680px] text-sm leading-6 text-[#52615c]">Monitor participants, listing lifecycle state and recent platform actions.</p></header>

    <section aria-label="Platform metrics" className="data-grid mt-5 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">{Object.entries(metrics).map(([key, metric]) => <div key={key} className="data-cell"><p className="stat-label">{labelize(key)}</p><p className="mt-2 text-2xl font-bold text-[#101816]">{metric}</p></div>)}</section>

    <section className="mt-8">
      <div className="section-kicker mb-3"><div><h2 className="text-base font-bold">Participants</h2><p className="mt-1 text-xs text-[#6b7873]">Buyer and Seller account status</p></div></div>
      <form className="market-panel mb-3 grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-[1.3fr_180px_180px_auto]"><label><span className="sr-only">Search users</span><input name="userSearch" defaultValue={userFilters.search ?? ""} placeholder="Search name, company or email" className="focus-ring field-line" /></label><label><span className="sr-only">Role</span><select name="role" defaultValue={userFilters.role ?? ""} className="focus-ring field-line"><option value="">All roles</option><option value="BUYER">Buyer</option><option value="SELLER">Seller</option></select></label><label><span className="sr-only">User status</span><select name="userStatus" defaultValue={userFilters.status ?? ""} className="focus-ring field-line"><option value="">All statuses</option><option value="ACTIVE">Active</option><option value="SUSPENDED">Suspended</option></select></label><button className="focus-ring action-primary h-11 px-4 text-[10px] font-bold uppercase tracking-[.08em]">Apply</button></form>
      <div className="overflow-x-auto border border-[#d8e1dd]"><table className="w-full text-left text-sm sm:min-w-[760px]"><thead className="sr-only bg-[#eef3f0] text-[10px] uppercase tracking-[.08em] text-[#6b7873] sm:table-header-group"><tr><th className="px-4 py-3">User</th><th>Role</th><th>Status</th><th>Created</th><th className="px-4 text-right">Action</th></tr></thead><tbody className="block divide-y divide-[#d8e1dd] sm:table-row-group">{users.items.map((user) => <tr key={user.id} className="block bg-white py-2 hover:bg-[#f8faf9] sm:table-row sm:py-0"><td data-label="User" className={stackedCell}><p className="font-semibold text-[#101816]">{user.displayName}</p><p className="break-words text-xs text-[#6b7873]">{user.companyName ?? user.email}</p></td><td data-label="Role" className={stackedMetaCell}>{labelize(user.role)}</td><td data-label="Status" className={stackedMetaCell}><span className={`deal-badge ${user.status === "ACTIVE" ? "status-live" : "status-warning"}`}>{labelize(user.status)}</span></td><td data-label="Created" className={stackedMetaCell}>{new Date(user.createdAt).toLocaleDateString("en-US")}</td><td data-label="Action" className={`${stackedMetaCell} sm:text-right`}>{user.status === "ACTIVE" ? <ModerationActionButton endpoint={`/api/v1/manager/users/${user.id}/status`} payload={{ status: "SUSPENDED" }} label="Suspend" /> : <ModerationActionButton endpoint={`/api/v1/manager/users/${user.id}/status`} payload={{ status: "ACTIVE" }} label="Restore" tone="restore" />}</td></tr>)}</tbody></table></div>
    </section>

    <section className="mt-9">
      <div className="section-kicker mb-3"><div><h2 className="text-base font-bold">Assets</h2><p className="mt-1 text-xs text-[#6b7873]">Marketplace supply and moderation state</p></div></div>
      <form className="market-panel mb-3 grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-[1.5fr_200px_auto]"><label><span className="sr-only">Search assets</span><input name="assetSearch" defaultValue={assetFilters.search ?? ""} placeholder="Search asset, country or seller" className="focus-ring field-line" /></label><label><span className="sr-only">Asset status</span><select name="assetStatus" defaultValue={assetFilters.status ?? ""} className="focus-ring field-line"><option value="">All statuses</option><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option><option value="SUSPENDED">Suspended</option></select></label><button className="focus-ring action-primary h-11 px-4 text-[10px] font-bold uppercase tracking-[.08em]">Apply</button></form>
      <div className="overflow-x-auto border border-[#d8e1dd]"><table className="w-full text-left text-sm sm:min-w-[780px]"><thead className="sr-only bg-[#eef3f0] text-[10px] uppercase tracking-[.08em] text-[#6b7873] sm:table-header-group"><tr><th className="px-4 py-3">Asset</th><th>Seller</th><th>Status</th><th>Category</th><th className="px-4 text-right">Action</th></tr></thead><tbody className="block divide-y divide-[#d8e1dd] sm:table-row-group">{assets.items.map((asset) => <tr key={asset.id} className="block bg-white py-2 hover:bg-[#f8faf9] sm:table-row sm:py-0"><td data-label="Asset" className={stackedCell}><Link href={`/assets/${asset.slug}`} className="font-semibold text-[#101816] hover:text-[#0d6b53]">{asset.title}</Link><p className="text-xs text-[#6b7873]">{asset.country} · {formatMoney(asset.askingPrice, asset.currency)}</p></td><td data-label="Seller" className={stackedMetaCell}>{asset.sellerCompanyName}</td><td data-label="Status" className={stackedMetaCell}><span className={`deal-badge ${asset.status === "PUBLISHED" ? "status-live" : asset.status === "SUSPENDED" ? "status-warning" : "status-muted"}`}>{labelize(asset.status)}</span></td><td data-label="Category" className={stackedMetaCell}>{labelize(asset.category)}</td><td data-label="Action" className={`${stackedMetaCell} sm:text-right`}>{asset.status === "SUSPENDED" ? <ModerationActionButton endpoint={`/api/v1/manager/assets/${asset.id}/status`} payload={{ status: "RESTORED" }} label="Restore" tone="restore" /> : <ModerationActionButton endpoint={`/api/v1/manager/assets/${asset.id}/status`} payload={{ status: "SUSPENDED" }} label="Suspend" />}</td></tr>)}</tbody></table></div>
    </section>

    <section className="mt-9"><div className="section-kicker"><div><h2 className="text-base font-bold">Recent audit</h2><p className="mt-1 text-xs text-[#6b7873]">Latest platform events</p></div></div><div className="mt-3 divide-y divide-[#d8e1dd] border border-[#d8e1dd]">{audit.slice(0, 12).map((event) => <div key={event.id} className="grid gap-2 bg-white px-4 py-3 text-sm md:grid-cols-[180px_1fr_190px]"><span className="font-semibold text-[#101816]">{labelize(event.action)}</span><span className="break-all text-[#52615c]">{event.entityType} · {event.entityId}</span><span className="text-xs text-[#6b7873]">{new Date(event.createdAt).toLocaleString("en-US")}</span></div>)}</div></section>
  </div></div>;
}
