"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(JSON.stringify({ level: "error", event: "app.error_boundary", digest: error.digest ?? null }));
  }, [error.digest]);

  return <main className="noise flex min-h-screen items-center justify-center px-5 py-16">
    <section className="max-w-[560px] border border-[#d8e1dd] bg-white p-8 text-center">
      <p className="eyebrow">Application error</p>
      <h1 className="mt-3 text-3xl font-semibold text-[#101816]">Something fell out of sync</h1>
      <p className="mt-4 text-sm leading-6 text-[#52615c]">The app kept the details private and surfaced a safe recovery path. Try again, or return to your workspace.</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button onClick={reset} className="focus-ring action-primary h-11 px-5 text-[10px] font-bold uppercase tracking-[.08em]">Try again</button>
        <Link href="/dashboard" className="focus-ring action-ghost inline-flex h-11 items-center px-5 text-[10px] font-bold uppercase tracking-[.08em]">Overview</Link>
      </div>
    </section>
  </main>;
}
