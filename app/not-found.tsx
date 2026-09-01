import Link from "next/link";

export default function NotFoundPage() {
  return <main className="noise flex min-h-screen items-center justify-center px-5 py-16">
    <section className="max-w-[520px] border border-[#d9d4c9] bg-[#f8f6f1] p-8 text-center">
      <p className="eyebrow">Not found</p>
      <h1 className="display mt-4 text-5xl leading-none tracking-[-.05em] text-[#172532]">This room is closed.</h1>
      <p className="mt-5 text-sm leading-6 text-[#50606a]">The resource may not exist, may be private, or may no longer be visible to your role.</p>
      <Link href="/dashboard" className="focus-ring mt-8 inline-block bg-[#172532] px-5 py-3 text-[10px] font-bold uppercase tracking-[.14em] text-[#f4f1ea]">Return to dashboard</Link>
    </section>
  </main>;
}
