"use client";

import { useState } from "react";
import { useForm, type UseFormRegister, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { assetCategories, dealTypes } from "@/validation/assets";
import { buyerProfileSchema, type BuyerProfileInput } from "@/validation/buyer";
import { labelize } from "@/lib/utils";

type BuyerProfileData = { id: string; fullName: string; companyName: string; investmentThesis: string; investmentMin: string | null; investmentMax: string | null; revenueMin: string | null; revenueMax: string | null; ebitdaMin: string | null; ebitdaMax: string | null; categories: Array<{ category: string }>; countries: Array<{ country: string }>; dealTypes: Array<{ dealType: string }> };

export function BuyerProfileForm({ profile }: { profile: BuyerProfileData }) {
  const [serverError, setServerError] = useState("");
  const [saved, setSaved] = useState(false);
  const countryDefaults = profile.countries.map((item) => item.country);
  const { register, setValue, handleSubmit, formState: { errors, isSubmitting } } = useForm<BuyerProfileInput>({ resolver: zodResolver(buyerProfileSchema), defaultValues: { fullName: profile.fullName, companyName: profile.companyName, investmentThesis: profile.investmentThesis, investmentMin: profile.investmentMin ?? "", investmentMax: profile.investmentMax ?? "", revenueMin: profile.revenueMin ?? "", revenueMax: profile.revenueMax ?? "", ebitdaMin: profile.ebitdaMin ?? "", ebitdaMax: profile.ebitdaMax ?? "", categories: profile.categories.map((item) => item.category as BuyerProfileInput["categories"][number]), countries: countryDefaults, dealTypes: profile.dealTypes.map((item) => item.dealType as BuyerProfileInput["dealTypes"][number]) } });

  async function onSubmit(values: BuyerProfileInput) {
    setServerError("");
    setSaved(false);
    try {
      const response = await fetch("/api/v1/buyer/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const result: { error?: { message?: string } } = await response.json();
      if (!response.ok) { setServerError(result.error?.message ?? "Unable to save your criteria."); return; }
      setSaved(true);
    } catch { setServerError("Network error. Please try again."); }
  }

  return <form onSubmit={handleSubmit(onSubmit)} noValidate>
    <ProfileSection title="Buyer identity" note="The counterparty identity visible to Sellers.">
      <Field label="Your name" error={errors.fullName?.message}><input {...register("fullName")} className={inputClass} /></Field>
      <Field label="Company" error={errors.companyName?.message}><input {...register("companyName")} className={inputClass} /></Field>
    </ProfileSection>

    <ProfileSection title="Acquisition thesis" note="A concise summary of your investment mandate.">
      <Field label="Investment thesis" hint="20–3,000 characters" error={errors.investmentThesis?.message} className="sm:col-span-2"><textarea {...register("investmentThesis")} rows={5} className={`${inputClass} h-auto resize-y py-3 leading-6`} /></Field>
    </ProfileSection>

    <ProfileSection title="Financial envelope" note="Investment, revenue and EBITDA parameters.">
      <Amount label="Minimum investment" registration={register("investmentMin")} error={errors.investmentMin?.message} />
      <Amount label="Maximum investment" registration={register("investmentMax")} error={errors.investmentMax?.message} />
      <Amount label="Minimum annual revenue" registration={register("revenueMin")} error={errors.revenueMin?.message} />
      <Amount label="Maximum annual revenue" registration={register("revenueMax")} error={errors.revenueMax?.message} />
      <Amount label="Minimum EBITDA" registration={register("ebitdaMin")} error={errors.ebitdaMin?.message} />
      <Amount label="Maximum EBITDA" registration={register("ebitdaMax")} error={errors.ebitdaMax?.message} />
    </ProfileSection>

    <ProfileSection title="Target profile" note="Sector, structure and geography preferences.">
      <ChoiceGroup title="Target categories" options={assetCategories} name="categories" register={register} errors={errors.categories?.message} />
      <ChoiceGroup title="Preferred deal types" options={dealTypes} name="dealTypes" register={register} errors={errors.dealTypes?.message} />
      <label className="block sm:col-span-2"><span className="mb-2 block stat-label">Target geographies</span><input defaultValue={countryDefaults.join(", ")} onChange={(event) => setValue("countries", event.target.value.split(",").map((item) => item.trim()).filter(Boolean), { shouldValidate: true })} placeholder="Germany, United Kingdom" className={inputClass} /><span className="mt-2 block text-[11px] text-[#87928e]">Separate countries with commas.</span>{errors.countries?.message && <span className="mt-2 block text-xs text-[#a53d35]">{errors.countries.message}</span>}</label>
    </ProfileSection>

    {serverError && <p role="alert" className="mt-5 border border-[#e1aaa5] bg-[#fff0ee] px-4 py-3 text-sm text-[#a53d35]">{serverError}</p>}
    {saved && <p role="status" className="mt-5 border border-[#b7d8ca] bg-[#e8f5ef] px-4 py-3 text-sm text-[#237354]">Your acquisition criteria are saved.</p>}
    <div className="mt-6 flex flex-col justify-between gap-4 border-t border-[#d8e1dd] pt-5 sm:flex-row sm:items-center"><p className="text-xs text-[#6b7873]">Criteria are private to your buyer profile.</p><button disabled={isSubmitting} className="focus-ring action-primary h-11 px-6 text-[10px] font-bold uppercase tracking-[.08em] disabled:opacity-60">{isSubmitting ? "Saving…" : "Save criteria"}</button></div>
  </form>;
}

const inputClass = "focus-ring field-line";

function ProfileSection({ title, note, children }: { title: string; note: string; children: React.ReactNode }) { return <section className="grid gap-5 border-t border-[#d8e1dd] py-6 first:border-t-0 first:pt-0 md:grid-cols-[180px_minmax(0,1fr)] md:gap-8"><div><h2 className="text-sm font-bold text-[#101816]">{title}</h2><p className="mt-1 text-xs leading-5 text-[#6b7873]">{note}</p></div><div className="grid gap-5 sm:grid-cols-2">{children}</div></section>; }
function Field({ label, hint, error, className = "", children }: { label: string; hint?: string; error?: string; className?: string; children: React.ReactNode }) { return <label className={`block ${className}`}><span className="mb-2 flex items-baseline justify-between stat-label"><span>{label}</span>{hint && <span className="font-normal tracking-normal normal-case text-[#87928e]">{hint}</span>}</span>{children}{error && <span className="mt-2 block text-xs text-[#a53d35]">{error}</span>}</label>; }
function Amount({ label, registration, error }: { label: string; registration: UseFormRegisterReturn; error?: string }) { return <Field label={label} error={error}><input {...registration} inputMode="decimal" placeholder="No limit" className={inputClass} /></Field>; }
function ChoiceGroup({ title, options, name, register, errors }: { title: string; options: readonly string[]; name: "categories" | "dealTypes"; register: UseFormRegister<BuyerProfileInput>; errors?: string }) { return <fieldset><legend className="mb-3 block stat-label">{title}</legend><div className="grid gap-2">{options.map((option) => <label key={option} className="flex min-h-9 cursor-pointer items-center gap-3 border-b border-[#edf1ef] text-sm text-[#40504b]"><input type="checkbox" value={option} {...register(name)} className="h-4 w-4 accent-[#0d6b53]" />{labelize(option)}</label>)}</div>{errors && <p className="mt-2 text-xs text-[#a53d35]">{errors}</p>}</fieldset>; }
