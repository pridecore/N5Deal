import Link from "next/link";

export default function NotFoundPage() {
  return <main className="noise flex min-h-screen items-center justify-center px-5 py-16">
    <section className="max-w-[520px] border border-[#d8e1dd] bg-white p-8 text-center">
      <p className="eyebrow">Not found</p>
      <h1 className="mt-3 text-3xl font-semibold text-[#101816]">Resource not available</h1>
      <p className="mt-4 text-sm leading-6 text-[#52615c]">The resource may not exist, may be private, or may no longer be visible to your role.</p>
      <Link href="/dashboard" className="focus-ring action-primary mt-7 inline-flex h-11 items-center px-5 text-[10px] font-bold uppercase tracking-[.08em]">Return to overview</Link>
    </section>
  </main>;
}
