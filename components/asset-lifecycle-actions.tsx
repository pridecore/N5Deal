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

  return <div className="flex flex-wrap items-center gap-2">{canPublish && <button disabled={busy} onClick={() => transition("publish")} className="focus-ring min-h-10 rounded-[3px] border border-[#0d6b53] px-3 text-[10px] font-bold uppercase tracking-[.08em] text-[#0d6b53] hover:bg-[#e7f3ee] disabled:opacity-50">Publish</button>}{canArchive && !confirming && <button disabled={busy} onClick={() => setConfirming(true)} className="focus-ring min-h-10 rounded-[3px] border border-[#b9c7c1] px-3 text-[10px] font-bold uppercase tracking-[.08em] text-[#52615c] hover:border-[#a53d35] hover:text-[#a53d35] disabled:opacity-50">Archive</button>}{confirming && <div className="flex flex-wrap items-center gap-2 border border-[#e1aaa5] bg-[#fff0ee] px-3 py-2"><span className="text-xs text-[#52615c]">Archive this asset?</span><button disabled={busy} onClick={() => transition("archive")} className="focus-ring min-h-8 text-[10px] font-bold uppercase tracking-[.08em] text-[#a53d35]">Confirm</button><button disabled={busy} onClick={() => setConfirming(false)} className="focus-ring min-h-8 text-[10px] font-bold uppercase tracking-[.08em] text-[#6b7873]">Cancel</button></div>}{error && <span role="alert" className="text-xs text-[#a53d35]">{labelize(error)}</span>}</div>;
}
