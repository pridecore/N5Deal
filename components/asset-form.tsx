"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { assetCategories, dealTypes, assetInputSchema, type CreateAssetInput } from "@/validation/assets";
import { labelize } from "@/lib/utils";

type AssetFormProps = { mode: "create" | "edit"; asset?: Partial<CreateAssetInput> & { id?: string; status?: string }; };

const blank: CreateAssetInput = { title: "", category: "FINTECH", country: "", description: "", askingPrice: "", currency: "EUR", revenue: "", ebitda: "", dealType: "FULL_ACQUISITION", businessStatus: "Trading" };

export function AssetForm({ mode, asset }: AssetFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<CreateAssetInput>({ resolver: zodResolver(assetInputSchema), defaultValues: { ...blank, ...asset } });

  async function onSubmit(values: CreateAssetInput) {
    setServerError(""); setIsSaving(true);
    try {
      const response = await fetch(mode === "create" ? "/api/v1/assets" : `/api/v1/assets/${asset?.id}`, { method: mode === "create" ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const result: { error?: { message?: string } } = await response.json();
      if (!response.ok) { setServerError(result.error?.message ?? "Unable to save this asset."); return; }
      router.push("/seller/assets"); router.refresh();
    } catch { setServerError("Network error. Please try again."); } finally { setIsSaving(false); }
  }

  return <form onSubmit={handleSubmit(onSubmit)} className="space-y-7" noValidate>
    <FormSection title="Asset identity" note="Core listing information for buyer review.">
      <Field label="Asset title" error={errors.title?.message} className="sm:col-span-2"><input {...register("title")} placeholder="e.g. Orbit Payments Ltd" className={inputClass} /></Field>
      <Field label="Category" error={errors.category?.message}><select {...register("category")} className={inputClass}>{assetCategories.map((value) => <option key={value} value={value}>{labelize(value)}</option>)}</select></Field>
      <Field label="Country" error={errors.country?.message}><input {...register("country")} placeholder="Germany" className={inputClass} /></Field>
    </FormSection>
    <FormSection title="Financials" note="Indicative figures shown on the opportunity record.">
      <Field label="Asking price" error={errors.askingPrice?.message}><input {...register("askingPrice")} inputMode="decimal" placeholder="12500000.00" className={inputClass} /></Field>
      <Field label="Currency" error={errors.currency?.message}><input {...register("currency")} maxLength={3} placeholder="EUR" className={`${inputClass} uppercase`} /></Field>
      <Field label="Annual revenue" hint="Optional" error={errors.revenue?.message}><input {...register("revenue")} inputMode="decimal" placeholder="5000000.00" className={inputClass} /></Field>
      <Field label="EBITDA" hint="Optional" error={errors.ebitda?.message}><input {...register("ebitda")} inputMode="decimal" placeholder="1200000.00" className={inputClass} /></Field>
    </FormSection>
    <FormSection title="Deal terms" note="Transaction criteria for marketplace discovery.">
      <Field label="Deal type" error={errors.dealType?.message}><select {...register("dealType")} className={inputClass}>{dealTypes.map((value) => <option key={value} value={value}>{labelize(value)}</option>)}</select></Field>
      <Field label="Business status" error={errors.businessStatus?.message}><input {...register("businessStatus")} placeholder="Trading" className={inputClass} /></Field>
    </FormSection>
    <section className="border-t border-[#d6d0c4] pt-5"><Field label="Business overview" hint="20–5,000 characters" error={errors.description?.message}><textarea {...register("description")} rows={7} placeholder="Describe the business, its position in the market, and the opportunity for a new owner…" className={`${inputClass} resize-y py-3 leading-6`} /></Field></section>
    {serverError && <p role="alert" className="border border-[#b7653b]/30 bg-[#b7653b]/10 px-4 py-3 text-sm text-[#9c4c2b]">{serverError}</p>}
    <div className="flex flex-col justify-between gap-4 border-t border-[#d9d4c9] pt-6 sm:flex-row sm:items-center"><p className="text-xs leading-5 text-[#7a817f]">Money is stored as PostgreSQL Decimal and sent as strings across the API.</p><button disabled={isSaving} className="focus-ring action-primary h-12 px-6 text-[10px] font-bold uppercase tracking-[.14em] disabled:cursor-wait disabled:opacity-60">{isSaving ? "Saving…" : mode === "create" ? "Save draft ↗" : "Save changes ↗"}</button></div>
  </form>;
}

const inputClass = "focus-ring field-line";

function Field({ label, hint, error, className = "", children }: { label: string; hint?: string; error?: string; className?: string; children: React.ReactNode }) { return <label className={`block ${className}`}><span className="mb-2 flex items-baseline justify-between stat-label"><span>{label}</span>{hint && <span className="font-normal tracking-normal normal-case text-[#a1a39b]">{hint}</span>}</span>{children}{error && <span className="mt-2 block text-xs text-[#b7653b]">{error}</span>}</label>; }

function FormSection({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return <section className="border-t border-[#d6d0c4] pt-5">
    <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end"><div><p className="eyebrow">{title}</p><p className="mt-1 text-xs leading-5 text-[#737a78]">{note}</p></div></div>
    <div className="grid gap-6 sm:grid-cols-2">{children}</div>
  </section>;
}
