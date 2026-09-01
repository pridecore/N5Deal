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
    setServerError(""); setSaved(false);
    try {
      const response = await fetch("/api/v1/buyer/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const result: { error?: { message?: string } } = await response.json();
      if (!response.ok) { setServerError(result.error?.message ?? "Unable to save your criteria."); return; }
      setSaved(true);
    } catch { setServerError("Network error. Please try again."); }
  }

  return <form onSubmit={handleSubmit(onSubmit)} className="space-y-10" noValidate><div className="grid gap-6 sm:grid-cols-2"><Field label="Your name" error={errors.fullName?.message}><input {...register("fullName")} className={inputClass} /></Field><Field label="Company" error={errors.companyName?.message}><input {...register("companyName")} className={inputClass} /></Field></div><Field label="Investment thesis" hint="20–3,000 characters" error={errors.investmentThesis?.message}><textarea {...register("investmentThesis")} rows={5} className={`${inputClass} h-auto resize-y py-3 leading-6`} /></Field><section><SectionTitle>Investment envelope</SectionTitle><div className="grid gap-6 sm:grid-cols-2"><Amount label="Minimum investment" registration={register("investmentMin")} error={errors.investmentMin?.message} /><Amount label="Maximum investment" registration={register("investmentMax")} error={errors.investmentMax?.message} /><Amount label="Minimum annual revenue" registration={register("revenueMin")} error={errors.revenueMin?.message} /><Amount label="Maximum annual revenue" registration={register("revenueMax")} error={errors.revenueMax?.message} /><Amount label="Minimum EBITDA" registration={register("ebitdaMin")} error={errors.ebitdaMin?.message} /><Amount label="Maximum EBITDA" registration={register("ebitdaMax")} error={errors.ebitdaMax?.message} /></div></section><section><SectionTitle>Target profile</SectionTitle><div className="grid gap-8 lg:grid-cols-3"><ChoiceGroup title="Categories" options={assetCategories} name="categories" register={register} errors={errors.categories?.message} /><ChoiceGroup title="Preferred deal types" options={dealTypes} name="dealTypes" register={register} errors={errors.dealTypes?.message} /><label className="block"><span className="mb-3 block stat-label">Target geographies</span><input defaultValue={countryDefaults.join(", ")} onChange={(event) => setValue("countries", event.target.value.split(",").map((item) => item.trim()).filter(Boolean), { shouldValidate: true })} placeholder="Germany, United Kingdom" className={inputClass} /><span className="mt-2 block text-[11px] text-[#a1a39b]">Separate countries with commas.</span>{errors.countries?.message && <span className="mt-2 block text-xs text-[#b7653b]">{errors.countries.message}</span>}</label></div></section>{serverError && <p role="alert" className="border border-[#b7653b]/30 bg-[#b7653b]/10 px-4 py-3 text-sm text-[#9c4c2b]">{serverError}</p>}{saved && <p role="status" className="border border-[#5f816d]/30 bg-[#d7e3dc] px-4 py-3 text-sm text-[#4f725f]">Your acquisition criteria are saved.</p>}<div className="flex flex-col justify-between gap-4 border-t border-[#d9d4c9] pt-6 sm:flex-row sm:items-center"><p className="text-xs text-[#7a817f]">Criteria are private to your buyer profile.</p><button disabled={isSubmitting} className="focus-ring action-primary h-12 px-6 text-[10px] font-bold uppercase tracking-[.14em] disabled:opacity-60">{isSubmitting ? "Saving…" : "Save criteria ↗"}</button></div></form>;
}

const inputClass = "focus-ring field-line";

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 flex items-baseline justify-between stat-label"><span>{label}</span>{hint && <span className="font-normal tracking-normal normal-case text-[#a1a39b]">{hint}</span>}</span>{children}{error && <span className="mt-2 block text-xs text-[#b7653b]">{error}</span>}</label>; }
function Amount({ label, registration, error }: { label: string; registration: UseFormRegisterReturn; error?: string }) { return <Field label={label} error={error}><input {...registration} inputMode="decimal" placeholder="No limit" className={inputClass} /></Field>; }
function ChoiceGroup({ title, options, name, register, errors }: { title: string; options: readonly string[]; name: "categories" | "dealTypes"; register: UseFormRegister<BuyerProfileInput>; errors?: string }) { return <fieldset><legend className="mb-3 block stat-label">{title}</legend><div className="space-y-2">{options.map((option) => <label key={option} className="flex cursor-pointer items-center gap-3 text-sm text-[#50606a]"><input type="checkbox" value={option} {...register(name)} className="accent-[#b7653b]" />{labelize(option)}</label>)}</div>{errors && <p className="mt-2 text-xs text-[#b7653b]">{errors}</p>}</fieldset>; }
function SectionTitle({ children }: { children: React.ReactNode }) { return <h2 className="mb-6 border-b border-[#d9d4c9] pb-3 text-[10px] font-bold uppercase tracking-[.16em] text-[#b7653b]">{children}</h2>; }
