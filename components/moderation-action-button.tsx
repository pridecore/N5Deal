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
    <button type="button" onClick={run} disabled={pending} className={`focus-ring px-3 py-2 text-[10px] font-bold uppercase tracking-[.12em] ${tone === "restore" ? "border border-[#5f816d] text-[#5f816d]" : "border border-[#b7653b] text-[#b7653b]"} disabled:opacity-60`}>{pending ? "Working..." : confirming ? "Confirm" : label}</button>
    {confirming && <button type="button" onClick={() => setConfirming(false)} className="text-[10px] uppercase tracking-[.12em] text-[#7a817f]">Cancel</button>}
    {error && <p className="max-w-[160px] text-right text-[10px] text-[#b7653b]">{error}</p>}
  </div>;
}
