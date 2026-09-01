"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { endpoint: string; payload: Record<string, string>; label: string; tone?: "danger" | "restore" };

export function ModerationActionButton({ endpoint, payload, label, tone = "danger" }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    if (!confirming) { setConfirming(true); return; }
    setPending(true); setError("");
    const response = await fetch(endpoint, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json();
    setPending(false);
    if (!response.ok) { setError(data.error?.message ?? "Moderation failed."); return; }
    setConfirming(false);
    router.refresh();
  }

  return <div className="inline-flex flex-col items-end gap-1">
    <button type="button" onClick={run} disabled={pending} className={`focus-ring min-h-9 rounded-[3px] px-3 text-[10px] font-bold uppercase tracking-[.08em] ${tone === "restore" ? "border border-[#0d6b53] text-[#0d6b53] hover:bg-[#e7f3ee]" : "border border-[#a53d35] text-[#a53d35] hover:bg-[#fff0ee]"} disabled:opacity-60`}>{pending ? "Working..." : confirming ? "Confirm" : label}</button>
    {confirming && <button type="button" onClick={() => setConfirming(false)} className="focus-ring min-h-8 text-[10px] uppercase tracking-[.08em] text-[#6b7873]">Cancel</button>}
    {error && <p className="max-w-[160px] text-right text-[10px] text-[#a53d35]">{error}</p>}
  </div>;
}
