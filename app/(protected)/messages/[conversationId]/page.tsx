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
  return <div className="noise min-h-screen"><div className="deal-shell max-w-[980px]">
    <Link href="/messages" className="focus-ring text-[10px] font-bold uppercase tracking-[.14em] text-[#7a817f] hover:text-[#b7653b]">← Back to inbox</Link>
    <section className="market-panel mt-8"><div className="border-b border-[#d9d4c9] p-5 sm:p-7"><p className="eyebrow">{conversation.asset?.title ?? "Direct conversation"}</p><h1 className="display mt-3 text-4xl tracking-[-.05em] text-[#172532]">{other.companyName}</h1><p className="mt-2 text-sm text-[#50606a]">Private platform thread. Contact details are intentionally not exposed.</p></div><div className="space-y-4 p-5 sm:p-7">{conversation.messages.length === 0 ? <p className="text-sm text-[#7a817f]">No messages yet.</p> : conversation.messages.map((message) => <div key={message.id} className={`max-w-[82%] border p-4 ${message.senderId === user.id ? "ml-auto border-[#172532] bg-[#172532] text-[#f4f1ea]" : "border-[#d9d4c9] bg-white/55 text-[#172532]"}`}><p className="whitespace-pre-wrap text-sm leading-6">{message.body}</p><p className="mt-3 text-[10px] uppercase tracking-[.12em] opacity-55">{new Date(message.createdAt).toLocaleString("en-US")}</p></div>)}</div><MessageComposer conversationId={conversation.id} /></section>
  </div></div>;
}
