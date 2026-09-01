"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MessageComposer({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true); setError("");
    const response = await fetch(`/api/v1/conversations/${conversationId}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }) });
    const payload = await response.json();
    setPending(false);
    if (!response.ok) { setError(payload.error?.message ?? "Message was not sent."); return; }
    setBody("");
    router.refresh();
  }

  return <form onSubmit={submit} className="border-t border-[#d8e1dd] bg-[#eef3f0] p-5">
    <label className="block"><span className="mb-2 block stat-label">Reply to thread</span><textarea value={body} onChange={(event) => setBody(event.target.value)} rows={3} maxLength={2000} placeholder="Write a concise deal message" className="focus-ring field-line min-h-[96px] resize-y bg-white leading-6" /></label>
    <div className="mt-3 flex items-center justify-between gap-3"><p role={error ? "alert" : undefined} className="text-xs text-[#a53d35]">{error}</p><button type="submit" disabled={pending} className="focus-ring action-primary h-10 px-5 text-[10px] font-bold uppercase tracking-[.08em] disabled:opacity-60">{pending ? "Sending…" : "Send message"}</button></div>
  </form>;
}
