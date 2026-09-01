import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/services/auth-service";
import { listConversations } from "@/server/services/conversation-service";

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const conversations = await listConversations(user.id);

  return <div className="min-h-screen"><div className="deal-shell max-w-[1120px]">
    <div className="flex flex-col justify-between gap-3 border-b border-[#d8e1dd] pb-5 sm:flex-row sm:items-end"><div><p className="eyebrow">Private deal room</p><h1 className="display compact-heading mt-2">Conversations</h1><p className="mt-3 text-sm text-[#52615c]">Participant and asset context remain attached to every private thread.</p></div><div className="data-grid grid-cols-2"><InboxMetric label="Threads" value={String(conversations.length)} /><InboxMetric label="Role" value={user.role.toLowerCase()} /></div></div>
    {conversations.length === 0 ? <section className="mt-5 border border-[#d8e1dd] bg-white py-16 text-center"><p className="eyebrow">No conversations</p><h2 className="mt-3 text-2xl font-semibold">Your deal room is empty</h2><p className="mx-auto mt-3 max-w-[430px] text-sm leading-6 text-[#52615c]">Start a conversation from an asset brief or Buyer mandate. Contact details remain private.</p></section> : <section aria-label="Conversation list" className="mt-5 overflow-hidden border border-[#d8e1dd] bg-white"><div className="hidden grid-cols-[52px_220px_1fr_130px] gap-4 border-b border-[#d8e1dd] bg-[#eef3f0] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[.08em] text-[#6b7873] md:grid"><span>Ref.</span><span>Counterparty</span><span>Asset and latest message</span><span className="text-right">Action</span></div>{conversations.map((conversation, index) => {
      const counterparty = user.role === "BUYER" ? conversation!.seller.companyName : conversation!.buyer.companyName;
      return <Link key={conversation!.id} href={`/messages/${conversation!.id}`} className="focus-ring grid gap-3 border-b border-[#e1e7e4] px-4 py-4 transition-colors last:border-0 hover:bg-[#f4f7f5] md:grid-cols-[52px_220px_1fr_130px] md:items-center md:gap-4"><span className="text-[10px] font-bold text-[#0d6b53]">{String(index + 1).padStart(2, "0")}</span><div><p className="text-sm font-bold text-[#101816]">{counterparty}</p><p className="mt-1 text-[10px] uppercase tracking-[.06em] text-[#6b7873]">{user.role === "BUYER" ? "Seller" : "Buyer"}</p></div><div className="min-w-0"><p className="truncate text-xs font-semibold text-[#26332f]">{conversation!.asset?.title ?? "Direct buyer conversation"}</p><p className="mt-1 truncate text-sm text-[#6b7873]">{conversation!.latestMessage?.body ?? "No messages yet"}</p></div><span className="text-[10px] font-bold uppercase tracking-[.08em] text-[#0d6b53] md:text-right">Open thread →</span></Link>;
    })}</section>}
  </div></div>;
}

function InboxMetric({ label, value }: { label: string; value: string }) { return <div className="data-cell min-w-[100px]"><p className="stat-label">{label}</p><p className="mt-1 text-sm font-bold capitalize">{value}</p></div>; }
