"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { labelize } from "@/lib/utils";

export function AssetLifecycleActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const canPublish = status === "DRAFT" || status === "ARCHIVED";
  const canArchive = status === "PUBLISHED";

  async function transition(action: "publish" | "archive") {
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/v1/assets/${id}/${action}`, { method: "POST" });
      const result: { error?: { message?: string } } = await response.json();
      if (!response.ok) { setError(result.error?.message ?? "Unable to update status."); return; }
      setConfirming(false); router.refresh();
    } catch { setError("Network error. Please try again."); } finally { setBusy(false); }
  }

  return <div className="flex flex-wrap items-center gap-3">{canPublish && <button disabled={busy} onClick={() => transition("publish")} className="focus-ring border border-[#5f816d] px-3 py-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#4f725f] hover:bg-[#d7e3dc] disabled:opacity-50">Publish ↗</button>}{canArchive && !confirming && <button disabled={busy} onClick={() => setConfirming(true)} className="focus-ring border border-[#d9d4c9] px-3 py-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#7a817f] hover:border-[#b7653b] hover:text-[#b7653b] disabled:opacity-50">Archive</button>}{confirming && <div className="flex items-center gap-2 border border-[#b7653b]/35 bg-[#fff8f3] px-3 py-2"><span className="text-xs text-[#7a817f]">Archive this asset?</span><button disabled={busy} onClick={() => transition("archive")} className="focus-ring text-[10px] font-bold uppercase tracking-[.1em] text-[#b7653b]">Yes</button><button disabled={busy} onClick={() => setConfirming(false)} className="focus-ring text-[10px] font-bold uppercase tracking-[.1em] text-[#7a817f]">Cancel</button></div>}{error && <span role="alert" className="text-xs text-[#b7653b]">{labelize(error)}</span>}</div>;
}
