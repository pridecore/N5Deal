"use client";

import { useState } from "react";
import { assetCategories, dealTypes, type AssetQueryInput } from "@/validation/assets";
import { labelize } from "@/lib/utils";

export function MarketplaceFilters({ filters }: { filters: AssetQueryInput }) {
  const [pending, setPending] = useState(false);
  return <form action="/marketplace" method="get" onSubmit={() => setPending(true)} className="market-panel p-5 lg:sticky lg:top-6 lg:shadow-none">
    <div className="flex items-center justify-between border-b border-[#d9d4c9] pb-4">
      <div><p className="eyebrow">Filters</p><p className="mt-1 text-xs leading-5 text-[#7a817f]">Structured deal search</p></div>
      <a href="/marketplace" className="focus-ring text-[10px] font-bold uppercase tracking-[.14em] text-[#b7653b]">Reset</a>
    </div>
    <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-1">
      <label className="block md:col-span-2 lg:col-span-1"><span className="mb-2 block stat-label">Search</span><input name="search" defaultValue={filters.search ?? ""} placeholder="Find a regulated asset..." className="focus-ring field-line" /></label>
      <FilterSelect name="category" label="Category" value={filters.category} options={assetCategories} />
      <label className="block"><span className="mb-2 block stat-label">Country</span><input name="country" defaultValue={filters.country ?? ""} placeholder="Germany, UK, Lithuania" className="focus-ring field-line" /></label>
      <FilterSelect name="dealType" label="Deal type" value={filters.dealType} options={dealTypes} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <label className="block"><span className="mb-2 block stat-label">Min price</span><input name="minPrice" defaultValue={filters.minPrice ?? ""} inputMode="decimal" placeholder="0" className="focus-ring field-line" /></label>
        <label className="block"><span className="mb-2 block stat-label">Max price</span><input name="maxPrice" defaultValue={filters.maxPrice ?? ""} inputMode="decimal" placeholder="No limit" className="focus-ring field-line" /></label>
      </div>
      <label className="block"><span className="mb-2 block stat-label">Business status</span><input name="businessStatus" defaultValue={filters.businessStatus ?? ""} placeholder="Trading or Growth" className="focus-ring field-line" /></label>
      <FilterSelect name="sort" label="Sort by" value={filters.sort} options={["newest", "oldest", "price-asc", "price-desc", "best-match"]} />
    </div>
    <button disabled={pending} className="focus-ring action-primary mt-6 h-11 w-full px-5 text-[10px] font-bold uppercase tracking-[.14em] disabled:cursor-wait disabled:opacity-60">{pending ? "Searching..." : "Apply filters"}</button>
    <p className="mt-4 text-[11px] leading-5 text-[#7a817f]">Server-side search. URL state remains shareable for review.</p>
  </form>;
}

function FilterSelect({ name, label, value, options }: { name: string; label: string; value?: string; options: readonly string[] }) {
  return <label className="block"><span className="mb-2 block stat-label">{label}</span><select name={name} defaultValue={value ?? ""} className="focus-ring field-line"><option value="">All</option>{options.map((option) => <option key={option} value={option}>{labelize(option)}</option>)}</select></label>;
}
