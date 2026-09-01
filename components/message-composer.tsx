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

  return <form onSubmit={submit} className="border-t border-[#d9d4c9] bg-[#e8e2d8]/45 p-5">
    <label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[.14em] text-[#7a817f]">Reply</span><textarea value={body} onChange={(event) => setBody(event.target.value)} rows={3} maxLength={2000} placeholder="Write a concise platform message" className="focus-ring w-full resize-none border border-[#d9d4c9] bg-[#f8f6f1] p-3 text-sm outline-none focus:border-[#b7653b]" /></label>
    <div className="mt-3 flex items-center justify-between gap-3"><p role={error ? "alert" : undefined} className="text-xs text-[#b7653b]">{error}</p><button type="submit" disabled={pending} className="focus-ring bg-[#172532] px-5 py-3 text-[10px] font-bold uppercase tracking-[.14em] text-[#f4f1ea] hover:bg-[#b7653b] disabled:opacity-60">{pending ? "Sending..." : "Send message"}</button></div>
  </form>;
}
