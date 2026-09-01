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

  return <form onSubmit={handleSubmit(onSubmit)} className="space-y-0" noValidate>
    <FormSection title="Asset identity" note="Core listing information for buyer review.">
      <Field label="Asset title" error={errors.title?.message} className="sm:col-span-2"><input {...register("title")} placeholder="e.g. Orbit Payments Ltd" className={inputClass} /></Field>
      <Field label="Category" error={errors.category?.message}><select {...register("category")} className={inputClass}>{assetCategories.map((value) => <option key={value} value={value}>{labelize(value)}</option>)}</select></Field>
      <Field label="Country" error={errors.country?.message}><input {...register("country")} placeholder="Germany" className={inputClass} /></Field>
    </FormSection>
    <FormSection title="Business information" note="Current operating profile shown to marketplace participants.">
      <Field label="Business status" error={errors.businessStatus?.message} className="sm:col-span-2"><input {...register("businessStatus")} placeholder="Trading" className={inputClass} /></Field>
    </FormSection>
    <FormSection title="Financials" note="Indicative figures shown on the opportunity record.">
      <Field label="Asking price" error={errors.askingPrice?.message}><input {...register("askingPrice")} inputMode="decimal" placeholder="12500000.00" className={inputClass} /></Field>
      <Field label="Currency" error={errors.currency?.message}><input {...register("currency")} maxLength={3} placeholder="EUR" className={`${inputClass} uppercase`} /></Field>
      <Field label="Annual revenue" hint="Optional" error={errors.revenue?.message}><input {...register("revenue")} inputMode="decimal" placeholder="5000000.00" className={inputClass} /></Field>
      <Field label="EBITDA" hint="Optional" error={errors.ebitda?.message}><input {...register("ebitda")} inputMode="decimal" placeholder="1200000.00" className={inputClass} /></Field>
    </FormSection>
    <FormSection title="Deal terms" note="Transaction structure used for marketplace discovery.">
      <Field label="Deal type" error={errors.dealType?.message} className="sm:col-span-2"><select {...register("dealType")} className={inputClass}>{dealTypes.map((value) => <option key={value} value={value}>{labelize(value)}</option>)}</select></Field>
    </FormSection>
    <FormSection title="Description" note="Concise opportunity narrative for qualified buyers."><Field label="Business overview" hint="20–5,000 characters" error={errors.description?.message} className="sm:col-span-2"><textarea {...register("description")} rows={7} placeholder="Describe the business, its position in the market, and the opportunity for a new owner…" className={`${inputClass} resize-y py-3 leading-6`} /></Field></FormSection>
    {serverError && <p role="alert" className="mt-5 border border-[#e1aaa5] bg-[#fff0ee] px-4 py-3 text-sm text-[#a53d35]">{serverError}</p>}
    <div className="mt-6 flex flex-col justify-between gap-4 border-t border-[#d8e1dd] pt-5 sm:flex-row sm:items-center"><p className="text-xs leading-5 text-[#6b7873]">Financial values are handled as exact decimal amounts.</p><button disabled={isSaving} className="focus-ring action-primary h-11 px-6 text-[10px] font-bold uppercase tracking-[.08em] disabled:cursor-wait disabled:opacity-60">{isSaving ? "Saving…" : mode === "create" ? "Save draft" : "Save changes"}</button></div>
  </form>;
}

const inputClass = "focus-ring field-line";

function Field({ label, hint, error, className = "", children }: { label: string; hint?: string; error?: string; className?: string; children: React.ReactNode }) { return <label className={`block ${className}`}><span className="mb-2 flex items-baseline justify-between stat-label"><span>{label}</span>{hint && <span className="font-normal tracking-normal normal-case text-[#87928e]">{hint}</span>}</span>{children}{error && <span className="mt-2 block text-xs text-[#a53d35]">{error}</span>}</label>; }

function FormSection({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return <section className="grid gap-5 border-t border-[#d8e1dd] py-6 md:grid-cols-[180px_minmax(0,1fr)] md:gap-8">
    <div><h2 className="text-sm font-bold text-[#101816]">{title}</h2><p className="mt-1 text-xs leading-5 text-[#6b7873]">{note}</p></div>
    <div className="grid gap-5 sm:grid-cols-2">{children}</div>
  </section>;
}
