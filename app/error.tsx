"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(JSON.stringify({ level: "error", event: "app.error_boundary", digest: error.digest ?? null }));
  }, [error.digest]);

  return <main className="noise flex min-h-screen items-center justify-center px-5 py-16">
    <section className="max-w-[560px] border border-[#d9d4c9] bg-[#f8f6f1] p-8 text-center">
      <p className="eyebrow">Application error</p>
      <h1 className="display mt-4 text-5xl leading-none tracking-[-.05em] text-[#172532]">Something fell out of sync.</h1>
      <p className="mt-5 text-sm leading-6 text-[#50606a]">The app kept the details private and surfaced a safe recovery path. Try again, or return to your workspace.</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button onClick={reset} className="focus-ring bg-[#172532] px-5 py-3 text-[10px] font-bold uppercase tracking-[.14em] text-[#f4f1ea]">Try again</button>
        <Link href="/dashboard" className="focus-ring border border-[#d9d4c9] px-5 py-3 text-[10px] font-bold uppercase tracking-[.14em] text-[#50606a]">Dashboard</Link>
      </div>
    </section>
  </main>;
}
