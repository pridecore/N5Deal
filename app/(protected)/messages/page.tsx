import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/services/auth-service";
import { listConversations } from "@/server/services/conversation-service";

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const conversations = await listConversations(user.id);
  return <div className="noise min-h-screen"><div className="deal-shell">
    <div className="border-b border-[#d9d4c9] pb-7"><p className="eyebrow">Messages / deal room</p><h1 className="display compact-heading mt-3 text-[#172532]">Deal conversations.</h1></div>
    {conversations.length === 0 ? <section className="py-20 text-center"><p className="eyebrow">No threads</p><h2 className="display mt-4 text-4xl tracking-[-.04em]">No active conversations yet.</h2><p className="mx-auto mt-4 max-w-[420px] text-sm leading-6 text-[#50606a]">Start from an asset brief or a buyer profile. Email addresses stay private.</p></section> : <div className="market-panel mt-7 divide-y divide-[#d9d4c9]">{conversations.map((conversation) => <Link key={conversation!.id} href={`/messages/${conversation!.id}`} className="focus-ring grid gap-3 p-5 transition-colors hover:bg-[#e8e2d8]/55 md:grid-cols-[1fr_auto]"><div><p className="text-sm font-bold text-[#172532]">{user.role === "BUYER" ? conversation!.seller.companyName : conversation!.buyer.companyName}</p><p className="mt-1 text-xs uppercase tracking-[.12em] text-[#7a817f]">{conversation!.asset?.title ?? "Direct buyer conversation"}</p><p className="mt-3 line-clamp-1 text-sm text-[#50606a]">{conversation!.latestMessage?.body ?? "No messages yet"}</p></div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#b7653b]">Open ↗</p></Link>)}</div>}
  </div></div>;
}
