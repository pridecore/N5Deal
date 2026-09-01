import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/server/services/auth-service";
import { getConversation } from "@/server/services/conversation-service";
import { MessageComposer } from "@/components/message-composer";

export default async function ConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { conversationId } = await params;
  let conversation: Awaited<ReturnType<typeof getConversation>>;
  try { conversation = await getConversation(conversationId, user.id); } catch { notFound(); }
  if (!conversation) notFound();
  const other = user.role === "BUYER" ? conversation.seller : conversation.buyer;

  return <div className="min-h-screen"><div className="deal-shell max-w-[1040px]">
    <Link href="/messages" className="focus-ring text-[10px] font-bold uppercase tracking-[.08em] text-[#6b7873] hover:text-[#0d6b53]">← Conversations</Link>
    <section className="market-panel mt-5 overflow-hidden">
      <header className="grid gap-4 border-b border-[#d8e1dd] bg-[#f8faf9] p-5 sm:grid-cols-[1fr_auto] sm:items-end"><div><p className="eyebrow">{conversation.asset?.title ?? "Direct buyer conversation"}</p><h1 className="mt-2 text-2xl font-semibold text-[#101816]">{other.companyName}</h1><p className="mt-2 text-xs text-[#6b7873]">Private participant thread · contact details are not exposed</p></div><span className="deal-badge status-live">Active thread</span></header>
      <div className="divide-y divide-[#e1e7e4] bg-white">{conversation.messages.length === 0 ? <p className="p-6 text-sm text-[#6b7873]">No messages yet.</p> : conversation.messages.map((message) => {
        const mine = message.senderId === user.id;
        return <article key={message.id} className={`grid gap-3 p-5 sm:grid-cols-[130px_1fr] ${mine ? "bg-[#f3f8f6]" : "bg-white"}`}><div><p className={`text-xs font-bold ${mine ? "text-[#176548]" : "text-[#26332f]"}`}>{mine ? "You" : other.companyName}</p><p className="mt-1 text-[10px] leading-4 text-[#77837e]">{new Date(message.createdAt).toLocaleString("en-US")}</p></div><p className="whitespace-pre-wrap text-sm leading-6 text-[#40504b]">{message.body}</p></article>;
      })}</div>
      <MessageComposer conversationId={conversation.id} />
    </section>
  </div></div>;
}
