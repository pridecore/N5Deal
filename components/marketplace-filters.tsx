"use client";

import { useState } from "react";
import { assetCategories, dealTypes, type AssetQueryInput } from "@/validation/assets";
import { labelize } from "@/lib/utils";

export function MarketplaceFilters({ filters }: { filters: AssetQueryInput }) {
  const [pending, setPending] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeCount = [filters.search, filters.category, filters.country, filters.minPrice, filters.maxPrice, filters.businessStatus, filters.dealType].filter(Boolean).length;

  return <div>
    <button type="button" aria-controls="marketplace-filter-panel" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)} className="focus-ring action-ghost flex h-11 w-full items-center justify-between px-4 text-xs font-semibold xl:hidden"><span>Filters {activeCount > 0 && `(${activeCount})`}</span><span aria-hidden="true">☷</span></button>
    {mobileOpen && <button type="button" aria-label="Close filters" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-[#101816]/35 xl:hidden" />}
    <form id="marketplace-filter-panel" action="/marketplace" method="get" onSubmit={() => setPending(true)} className={`${mobileOpen ? "fixed inset-x-0 bottom-0 z-50 block max-h-[88vh] overflow-y-auto rounded-t-[6px]" : "hidden"} market-panel p-5 xl:sticky xl:top-[92px] xl:block xl:max-h-[calc(100vh-116px)] xl:overflow-y-auto xl:shadow-none`}>
      <div className="flex items-start justify-between gap-4 border-b border-[#d8e1dd] pb-4">
        <div><p className="text-sm font-bold text-[#101816]">Filter opportunities</p><p className="mt-1 text-xs text-[#6b7873]">Narrow the active marketplace</p></div>
        <div className="flex items-center gap-4"><a href="/marketplace" className="focus-ring text-[10px] font-bold uppercase tracking-[.08em] text-[#0d6b53]">Reset</a><button type="button" aria-label="Close filters" onClick={() => setMobileOpen(false)} className="focus-ring flex h-8 w-8 items-center justify-center border border-[#b9c7c1] text-lg xl:hidden">×</button></div>
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-1">
        <label className="block md:col-span-2 xl:col-span-1"><span className="mb-2 block stat-label">Search</span><input name="search" defaultValue={filters.search ?? ""} placeholder="Title, country or description" className="focus-ring field-line" /></label>
        <FilterSelect name="category" label="Category" value={filters.category} options={assetCategories} />
        <label className="block"><span className="mb-2 block stat-label">Country</span><input name="country" defaultValue={filters.country ?? ""} placeholder="e.g. United Kingdom" className="focus-ring field-line" /></label>
        <fieldset className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1"><legend className="mb-2 stat-label">Price range</legend><label><span className="sr-only">Minimum price</span><input name="minPrice" defaultValue={filters.minPrice ?? ""} inputMode="decimal" placeholder="Minimum" className="focus-ring field-line" /></label><label><span className="sr-only">Maximum price</span><input name="maxPrice" defaultValue={filters.maxPrice ?? ""} inputMode="decimal" placeholder="Maximum" className="focus-ring field-line" /></label></fieldset>
        <label className="block"><span className="mb-2 block stat-label">Business status</span><input name="businessStatus" defaultValue={filters.businessStatus ?? ""} placeholder="e.g. Trading" className="focus-ring field-line" /></label>
        <FilterSelect name="dealType" label="Deal type" value={filters.dealType} options={dealTypes} />
        <FilterSelect name="sort" label="Sort by" value={filters.sort} options={["newest", "oldest", "price-asc", "price-desc", "best-match"]} />
        <button disabled={pending} className="focus-ring action-primary h-11 w-full px-5 text-[10px] font-bold uppercase tracking-[.08em] disabled:cursor-wait disabled:opacity-60">{pending ? "Applying…" : "Apply filters"}</button>
      </div>
    </form>
  </div>;
}

function FilterSelect({ name, label, value, options }: { name: string; label: string; value?: string; options: readonly string[] }) {
  return <label className="block"><span className="mb-2 block stat-label">{label}</span><select name={name} defaultValue={value ?? ""} className="focus-ring field-line"><option value="">All</option>{options.map((option) => <option key={option} value={option}>{labelize(option)}</option>)}</select></label>;
}
