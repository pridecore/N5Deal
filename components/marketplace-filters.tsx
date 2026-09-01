"use client";

import { useState } from "react";
import { assetCategories, dealTypes, type AssetQueryInput } from "@/validation/assets";
import { labelize } from "@/lib/utils";

export function MarketplaceFilters({ filters }: { filters: AssetQueryInput }) {
  const [pending, setPending] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return <form action="/marketplace" method="get" onSubmit={() => setPending(true)} data-open={mobileOpen ? "true" : "false"} className="market-filter market-panel p-4 xl:sticky xl:top-6 xl:shadow-none">
    <div className="flex items-start justify-between gap-4 border-b border-[#d6d0c4] pb-3">
      <FilterHeader />
      <button type="button" aria-label={mobileOpen ? "Collapse filters" : "Expand filters"} aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)} className="focus-ring text-lg text-[#a85834] xl:hidden">{mobileOpen ? "×" : "+"}</button>
    </div>
    <div className="filter-fields mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-1">
      <FilterFields filters={filters} pending={pending} />
      <FilterFooter />
    </div>
  </form>;
}

function FilterFields({ filters, pending }: { filters: AssetQueryInput; pending: boolean }) {
  return <>
    <label className="block md:col-span-2 xl:col-span-1"><span className="mb-2 block stat-label">Search the room</span><input name="search" defaultValue={filters.search ?? ""} placeholder="Find the perfect Asset..." className="focus-ring field-line" /></label>
    <FilterSelect name="category" label="Category" value={filters.category} options={assetCategories} />
    <label className="block"><span className="mb-2 block stat-label">Country</span><input name="country" defaultValue={filters.country ?? ""} placeholder="United Kingdom, Germany" className="focus-ring field-line" /></label>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
      <label className="block"><span className="mb-2 block stat-label">Price Range · Min</span><input name="minPrice" defaultValue={filters.minPrice ?? ""} inputMode="decimal" placeholder="0" className="focus-ring field-line" /></label>
      <label className="block"><span className="mb-2 block stat-label">Price Range · Max</span><input name="maxPrice" defaultValue={filters.maxPrice ?? ""} inputMode="decimal" placeholder="No limit" className="focus-ring field-line" /></label>
    </div>
    <label className="block"><span className="mb-2 block stat-label">Business status</span><input name="businessStatus" defaultValue={filters.businessStatus ?? ""} placeholder="Trading or Growth" className="focus-ring field-line" /></label>
    <FilterSelect name="dealType" label="Deal type" value={filters.dealType} options={dealTypes} />
    <FilterSelect name="sort" label="Sort by" value={filters.sort} options={["newest", "oldest", "price-asc", "price-desc", "best-match"]} />
    <button disabled={pending} className="focus-ring action-primary h-11 w-full px-5 text-[10px] font-bold uppercase tracking-[.14em] disabled:cursor-wait disabled:opacity-60">{pending ? "Searching..." : "Apply filters"}</button>
    <a href="/marketplace" className="focus-ring text-center text-[10px] font-bold uppercase tracking-[.14em] text-[#a85834] xl:hidden">Reset all filters</a>
  </>;
}

function FilterSelect({ name, label, value, options }: { name: string; label: string; value?: string; options: readonly string[] }) {
  return <label className="block"><span className="mb-2 block stat-label">{label}</span><select name={name} defaultValue={value ?? ""} className="focus-ring field-line"><option value="">All</option>{options.map((option) => <option key={option} value={option}>{labelize(option)}</option>)}</select></label>;
}

function FilterHeader() {
  return <div className="flex flex-1 items-center justify-between gap-4">
    <div><p className="eyebrow">Filters</p><p className="mt-1 text-xs leading-5 text-[#737a78]">Country, price, status, deal type</p></div>
    <a href="/marketplace" className="focus-ring hidden text-[10px] font-bold uppercase tracking-[.14em] text-[#a85834] xl:inline">Reset</a>
  </div>;
}

function FilterFooter() {
  return <p className="mt-4 text-[11px] leading-5 text-[#737a78]">Filtered views can be shared with the review team.</p>;
}
