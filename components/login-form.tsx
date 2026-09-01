"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/validation/auth";

const demoUsers = [
  { label: "Buyer", email: "buyer@n5deal.demo", password: "BuyerDemo2025!" },
  { label: "Seller", email: "seller@n5deal.demo", password: "SellerDemo2025!" },
  { label: "Manager", email: "manager@n5deal.demo", password: "ManagerDemo2025!" },
];

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, setValue, handleSubmit, formState: { errors } } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setServerError(""); setIsSubmitting(true);
    try {
      const response = await fetch("/api/v1/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const result: { data?: unknown; error?: { message?: string } } = await response.json();
      if (!response.ok) { setServerError(result.error?.message ?? "Unable to sign in."); return; }
      router.push("/dashboard"); router.refresh();
    } catch { setServerError("Network error. Please try again."); } finally { setIsSubmitting(false); }
  }

  return <>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <label className="block"><span className="mb-2 block text-[11px] font-bold uppercase tracking-[.13em] text-white/55">Email address</span><input {...register("email")} type="email" autoComplete="email" placeholder="you@company.com" className="focus-ring h-12 w-full border-b border-white/25 bg-transparent px-0 text-[15px] text-white outline-none placeholder:text-white/30 focus:border-[#d49a79]" />{errors.email && <span className="mt-1 block text-xs text-[#f2a78c]">{errors.email.message}</span>}</label>
      <label className="block"><span className="mb-2 block text-[11px] font-bold uppercase tracking-[.13em] text-white/55">Password</span><input {...register("password")} type="password" autoComplete="current-password" placeholder="••••••••••" className="focus-ring h-12 w-full border-b border-white/25 bg-transparent px-0 text-[15px] text-white outline-none placeholder:text-white/30 focus:border-[#d49a79]" />{errors.password && <span className="mt-1 block text-xs text-[#f2a78c]">{errors.password.message}</span>}</label>
      {serverError && <p role="alert" className="border border-[#f2a78c]/35 bg-[#f2a78c]/10 px-3 py-2 text-xs leading-5 text-[#f2c1ac]">{serverError}</p>}
      <button disabled={isSubmitting} className="focus-ring group flex h-12 w-full items-center justify-between bg-[#b7653b] px-4 text-xs font-bold uppercase tracking-[.14em] text-white transition-colors hover:bg-[#c77950] disabled:cursor-wait disabled:opacity-60">{isSubmitting ? "Opening room…" : "Continue securely"}<span className="text-lg transition-transform group-hover:translate-x-1">↗</span></button>
    </form>
    <div className="mt-8"><p className="mb-3 text-[10px] font-bold uppercase tracking-[.15em] text-white/35">Demo identity</p><div className="grid grid-cols-3 gap-2">{demoUsers.map((demo) => <button key={demo.email} type="button" onClick={() => { setValue("email", demo.email); setValue("password", demo.password); setServerError(""); }} className="focus-ring border border-white/15 px-2 py-2 text-[10px] font-bold uppercase tracking-[.1em] text-white/60 transition-colors hover:border-[#d49a79] hover:text-[#f4f1ea]">{demo.label}</button>)}</div></div>
  </>;
}
