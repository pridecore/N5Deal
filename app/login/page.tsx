import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="noise min-h-screen overflow-hidden bg-[#f3f0e8]">
      <div className="fine-grid absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative mx-auto grid min-h-screen max-w-[1440px] grid-cols-1 lg:grid-cols-[1fr_440px]">
        <section className="relative flex min-h-[560px] flex-col px-6 py-6 sm:px-10 lg:min-h-screen lg:px-16 lg:py-10">
          <div className="flex items-center justify-between gap-4 rise">
            <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center bg-[#111a22] text-xs font-bold tracking-[-.08em] text-[#f3f0e8]">N5</span><span className="text-xs font-bold tracking-[.18em] text-[#111a22]">N5DEAL</span></div>
            <span className="deal-badge status-live">Private marketplace</span>
          </div>
          <div className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[.9fr_1.1fr]">
            <div className="max-w-[460px]">
              <div className="eyebrow mb-4 rise rise-delay">Regulated asset access</div>
              <h1 className="display text-[clamp(2.6rem,5.8vw,5.5rem)] leading-[.92] tracking-[-.05em] text-[#111a22] rise rise-delay-2">
                Asset listings for serious acquisition intent.
              </h1>
              <p className="mt-6 text-[15px] leading-7 text-[#485862] rise rise-delay-2">Buyer, Seller, and Manager workflows around financial assets, acquisition criteria, Smart Match, private messages, moderation, and audit visibility.</p>
            </div>
            <div className="market-panel hidden p-4 lg:block rise rise-delay-2" aria-hidden="true">
              <div className="flex items-center justify-between border-b border-[#d6d0c4] pb-3"><p className="eyebrow">Marketplace preview</p><span className="deal-badge">Validated</span></div>
              {[
                ["Asset ID #000741", "UK EMI / Fintech", "€32.0M"],
                ["Asset ID #000750", "Payments / UK", "£18.5M"],
                ["Asset ID #000560", "Crypto / Switzerland", "CHF27.0M"],
              ].map(([id, meta, price]) => <div key={id} className="grid grid-cols-[1fr_auto] gap-4 border-b border-[#d6d0c4] py-4 last:border-b-0"><div><p className="stat-label">{id}</p><p className="mt-2 text-sm font-bold text-[#111a22]">{meta}</p><p className="mt-1 text-xs text-[#737a78]">Country, license signal, status, match context</p></div><p className="text-xl font-extrabold text-[#111a22]">{price}</p></div>)}
            </div>
          </div>
          <div className="hidden items-end justify-between border-t border-[#d6d0c4] pt-4 text-[10px] font-bold uppercase tracking-[.14em] text-[#737a78] lg:flex rise rise-delay-2">
            <span>Private deal room · production prototype</span><span>Secure access</span>
          </div>
        </section>
        <section className="relative flex items-center border-t border-[#d6d0c4] bg-[#111a22] px-6 py-12 text-[#f3f0e8] sm:px-10 lg:border-l lg:border-t-0 lg:px-12">
          <div className="relative w-full max-w-[340px] rise">
            <div className="mb-10"><p className="eyebrow text-[#cf8b65]">Reviewer access</p><h2 className="display mt-3 text-4xl tracking-[-.04em]">Enter the room.</h2><p className="mt-3 text-xs leading-5 text-white/45">Select a seeded demo identity or enter credentials manually.</p></div>
            <LoginForm />
            <p className="mt-10 border-t border-white/15 pt-5 text-[11px] leading-5 text-white/45">Role-based demo access is available for Buyer, Seller, and Manager review paths.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
