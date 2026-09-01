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
    <label className="block"><span className="mb-2 block stat-label">Private message</span><textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={4} maxLength={2000} className="focus-ring field-line resize-y bg-white leading-5" /></label>
    {error && <p role="alert" className="text-xs text-[#a53d35]">{error}</p>}
    <button type="submit" disabled={pending} className="focus-ring action-primary flex h-11 w-full items-center justify-between px-4 text-[10px] font-bold uppercase tracking-[.08em] disabled:opacity-60">{pending ? "Creating thread…" : "Contact buyer"} <span aria-hidden="true">→</span></button>
  </form>;
}
