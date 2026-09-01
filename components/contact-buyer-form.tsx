"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ContactBuyerForm({ buyerId }: { buyerId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("I think one of our opportunities may fit your acquisition criteria.");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true); setError("");
    const response = await fetch("/api/v1/conversations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ buyerId, message }) });
    const payload = await response.json();
    setPending(false);
    if (!response.ok) { setError(payload.error?.message ?? "Could not contact buyer."); return; }
    router.push(`/messages/${payload.data.id}`);
  }

  return <form onSubmit={submit} className="space-y-3">
    <label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[.14em] text-[#7a817f]">Message buyer</span><textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={4} maxLength={2000} className="focus-ring w-full resize-none border border-[#d9d4c9] bg-[#f8f6f1] p-3 text-sm outline-none focus:border-[#b7653b]" /></label>
    {error && <p className="text-xs text-[#b7653b]">{error}</p>}
    <button type="submit" disabled={pending} className="focus-ring flex h-12 w-full items-center justify-between bg-[#172532] px-4 text-[10px] font-bold uppercase tracking-[.13em] text-[#f4f1ea] transition-colors hover:bg-[#b7653b] disabled:opacity-60">{pending ? "Creating thread..." : "Contact buyer"} <span className="text-base" aria-hidden="true">↗</span></button>
  </form>;
}
